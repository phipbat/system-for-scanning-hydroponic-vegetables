<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camera;
use App\Models\CameraAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CameraController extends Controller
{
    /**
     * ดึงรายการกล้อง
     */
    public function index()
    {
        $cameras = Camera::all();
        return response()->json(['status' => 'success', 'data' => $cameras]);
    }

    /**
     * ดึงประวัติการวิเคราะห์ (CameraAnalysis) ทั้งหมดหรือกรองตาม camera_id
     */
    public function getAnalyses(Request $request)
    {
        $query = CameraAnalysis::orderBy('timestamp', 'desc');

        if ($request->has('camera_id')) {
            $query->where('camera_id', $request->camera_id);
        }

        $analyses = $query->get();
        return response()->json(['status' => 'success', 'data' => $analyses]);
    }

    /**
     * ดึงภาพ Snapshot จาก Python Server (py run)
     */
    public function getSnapshot($id = null)
    {
        $camera = $id ? Camera::find($id) : Camera::first();
        
        if (!$camera || empty($camera->stream_url)) {
            return response()->json(['error' => 'Camera not found or no stream URL'], 404);
        }

        try {
            // เรียกไปยัง Python Flask Server ที่รันอยู่ (py run)
            $response = \Illuminate\Support\Facades\Http::timeout(5)->get('http://127.0.0.1:5000/snapshot', [
                'url' => $camera->stream_url
            ]);

            if ($response->successful()) {
                return response($response->body())
                    ->header('Content-Type', 'image/jpeg')
                    ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Python Snapshot Error: ' . $e->getMessage());
        }

        return response()->json(['error' => 'Failed to get snapshot from Python server'], 500);
    }

    /**
     * สร้างกล้องใหม่
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'stream_url' => 'nullable|string',
        ]);

        $farmId = \App\Models\Farm::first()->id ?? 1;

        $camera = Camera::create([
            'farm_id' => $farmId, // Dynamic fallback
            'name' => $request->name,
            'stream_url' => $request->stream_url ?? '',
            'status' => 'active'
        ]);

        return response()->json(['status' => 'success', 'data' => $camera]);
    }

    /**
     * ลบรายการกล้อง
     */
    public function destroy($id)
    {
        $camera = Camera::findOrFail($id);
        $camera->delete();
        return response()->json(['status' => 'success', 'message' => 'Camera deleted']);
    }

    /**
     * บันทึกผลการวิเคราะห์จากมือถือ (Manual Sync)
     */
    public function syncAnalysis(Request $request)
    {
        $data = $request->all();
        
        // จัดการรูปภาพ Base64
        if ($request->has('image_base64')) {
            $image = $request->input('image_base64');
            $image = str_replace('data:image/jpeg;base64,', '', $image);
            $image = str_replace(' ', '+', $image);
            $imageName = 'manual_' . time() . '_' . Str::random(10) . '.jpg';
            Storage::disk('public')->put('analyses/' . $imageName, base64_decode($image));
            $data['image_path'] = 'analyses/' . $imageName;
        }

        $data['timestamp'] = now();
        $analysis = CameraAnalysis::create($data);

        return response()->json([
            'status' => 'success',
            'data' => $analysis
        ]);
    }

    /**
     * ลบรายการวิเคราะห์
     */
    public function destroyAnalysis($id)
    {
        $analysis = CameraAnalysis::findOrFail($id);
        if ($analysis->image_path) {
            Storage::disk('public')->delete($analysis->image_path);
        }
        $analysis->delete();
        return response()->json(['status' => 'success', 'message' => 'Deleted']);
    }

    /**
     * รับผลวิเคราะห์อัตโนมัติจาก Python Scheduler → บันทึก + ส่ง Push Notification
     */
    public function autoAnalysis(Request $request)
    {
        // ตรวจ secret key กัน spam จาก external
        if ($request->input('secret') !== 'plantoye_auto_2024') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // บันทึกภาพ base64 ลง storage
        $data = $request->except('secret');
        if ($request->has('image_base64')) {
            $image = str_replace('data:image/jpeg;base64,', '', $request->input('image_base64'));
            $image = str_replace(' ', '+', $image);
            $imageName = 'auto_' . time() . '_' . \Illuminate\Support\Str::random(8) . '.jpg';
            Storage::disk('public')->put('analyses/' . $imageName, base64_decode($image));
            $data['image_path'] = 'analyses/' . $imageName;
            unset($data['image_base64']);
        }

        $data['timestamp'] = now();
        $data['source']    = 'Auto Schedule';
        $analysis = CameraAnalysis::create($data);

        // ส่ง Push Notification ไปยังผู้ใช้ทุกคนที่มี push_token
        $isDanger = ($data['health_status'] ?? '') === 'Danger';
        $title    = $isDanger ? '⚠️ ตรวจพบความผิดปกติ!' : '✅ ตรวจสอบสุขภาพพืชปกติ';
        $body     = \Illuminate\Support\Str::limit($data['diagnosis_summary'] ?? '', 80);

        $tokens = \App\Models\User::whereNotNull('push_token')
            ->pluck('push_token')
            ->toArray();

        if (!empty($tokens)) {
            $this->sendExpoPushNotification($tokens, $title, $body, [
                'type'        => 'auto_analysis',
                'analysisId'  => $analysis->id,
                'healthStatus'=> $data['health_status'] ?? 'Healthy',
            ]);
        }

        // บันทึก Notification ใน DB (ทุก user)
        $users = \App\Models\User::whereNotNull('push_token')->get();
        foreach ($users as $u) {
            \App\Models\Notification::create([
                'user_id'            => $u->id,
                'camera_analysis_id' => $analysis->id,
                'title'              => $title,
                'message'            => $body,
                'type'               => $isDanger ? 'danger' : 'info',
                'is_read'            => false,
            ]);
        }

        return response()->json(['status' => 'success', 'id' => $analysis->id]);
    }

    /**
     * ส่ง Expo Push Notification
     */
    private function sendExpoPushNotification(array $tokens, string $title, string $body, array $data = [])
    {
        $messages = array_map(fn($token) => [
            'to'    => $token,
            'title' => $title,
            'body'  => $body,
            'data'  => $data,
            'sound' => 'default',
            'priority' => 'high',
        ], $tokens);

        try {
            \Illuminate\Support\Facades\Http::timeout(10)
                ->withHeaders(['Accept' => 'application/json', 'Content-Type' => 'application/json'])
                ->post('https://exp.host/--/api/v2/push/send', $messages);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Push notification failed: ' . $e->getMessage());
        }
    }

    /**
     * เช็ครายการที่ถูกลบ (สำหรับ Offline Sync)
     */
    public function checkDeletedAnalysis(Request $request)
    {
        $ids = $request->input('ids', []);
        $existingIds = CameraAnalysis::whereIn('id', $ids)->pluck('id')->toArray();
        $deletedIds = array_diff($ids, $existingIds);
        return response()->json(['status' => 'success', 'data' => array_values($deletedIds)]);
    }

    /**
     * สตรีมวิดีโอสด (MJPEG Proxy) - ต่อท่อตรงจาก Python
     */
    public function mjpegStream($id = null)
    {
        $camera = $id ? Camera::find($id) : Camera::first();
        if (!$camera) return response()->json(['error' => 'Camera not found'], 404);

        $url = "http://127.0.0.1:5000/video_feed";

        return response()->stream(function() use ($url) {
            try {
                // เพิ่มเวลาการทำงานไม่จำกัดสำหรับสตรีม
                set_time_limit(0);
                $handle = fopen($url, 'rb');
                if ($handle) {
                    while (!feof($handle) && connection_status() == 0) {
                        echo fread($handle, 8192);
                        ob_flush();
                        flush();
                    }
                    fclose($handle);
                }
            } catch (\Exception $e) {
                \Log::error("MJPEG Stream Error: " . $e->getMessage());
            }
        }, 200, [
            'Content-Type' => 'multipart/x-mixed-replace; boundary=frame',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Connection' => 'close',
        ]);
    }

    /**
     * หน้าจอสำหรับดู Live Stream (HTML Wrapper) - แก้ปัญหา Emulator จอดำ
     */
    public function liveViewer(Request $request, $id = null)
    {
        $camera = $id ? Camera::find($id) : Camera::first();
        if (!$camera) return "Camera not found";

        // โหลด snapshot จาก Python server (port 5000) โดยตรง ไม่ผ่าน PHP proxy
        // Python /snapshot ไม่รับ url parameter — return latest_frame จากกล้องโดยตรง
        $host = $request->getSchemeAndHttpHost(); // e.g. http://10.0.2.2:8000
        $pythonBase = preg_replace('/:\d+$/', ':5000', $host); // http://10.0.2.2:5000
        $snapshotBase = $pythonBase . '/snapshot';

        return <<<HTML
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
                    #canvas { display: none; width: 100%; height: 100%; object-fit: contain; }
                    .status { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
                              color: #fff; text-align: center; font-family: sans-serif; width: 90%; }
                    .status p { margin: 8px 0; }
                    .icon { font-size: 48px; }
                    .sub { font-size: 12px; opacity: 0.5; }
                </style>
            </head>
            <body>
                <canvas id="canvas"></canvas>
                <div id="loading" class="status">
                    <p class="icon">📡</p>
                    <p>กำลังเชื่อมต่อกล้อง...</p>
                </div>
                <div id="error" class="status" style="display:none;">
                    <p class="icon">📷</p>
                    <p>กล้องไม่ตอบสนอง</p>
                    <p class="sub">ตรวจสอบการเชื่อมต่อกล้องและ Python server</p>
                </div>
                <script>
                    var canvas  = document.getElementById('canvas');
                    var ctx     = canvas.getContext('2d');
                    var loading = document.getElementById('loading');
                    var err     = document.getElementById('error');
                    var base    = '{$snapshotBase}';
                    var tick    = 0;
                    var started = false;

                    function loadNext() {
                        var img = new Image();
                        img.onload = function() {
                            if (!started) {
                                started = true;
                                canvas.width  = img.naturalWidth  || 640;
                                canvas.height = img.naturalHeight || 480;
                                loading.style.display = 'none';
                                canvas.style.display  = 'block';
                            }
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            setTimeout(loadNext, 200);
                        };
                        img.onerror = function() {
                            if (!started) {
                                loading.style.display = 'none';
                                err.style.display     = 'block';
                            }
                            setTimeout(loadNext, 1000);
                        };
                        img.src = base + '?t=' + (++tick);
                    }

                    setTimeout(function() {
                        if (!started) {
                            loading.style.display = 'none';
                            err.style.display     = 'block';
                        }
                    }, 10000);

                    loadNext();
                </script>
            </body>
        </html>
HTML;
    }
}
