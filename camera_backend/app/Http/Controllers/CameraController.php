<?php
// ไฟล์สำหรับ CameraController (จัดการข้อมูลกล้อง แสดงผลกราฟ และการเชื่อมต่อ Proxy สำหรับดูภาพสด)

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Camera;
use App\Http\Controllers\CameraSettingsController;

class CameraController extends Controller
{
    /** @var string ไอพีของกล้อง */
    private $cameraIp;
    /** @var string ชื่อผู้ใช้ */
    private $username;
    /** @var string รหัสผ่าน */
    private $password;

    public function __construct()
    {
        $settings = CameraSettingsController::getSettings();
        $this->cameraIp = $settings['cameraIp'];
        $this->username = $settings['username'];
        $this->password = $settings['password'];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $farms = \App\Models\Farm::with('cameras')->get();
        $selected_farm = null;

        if ($request->has('farm_id')) {
            $selected_farm = \App\Models\Farm::with('cameras')->find($request->farm_id);
        }

        // ถ้าไม่มี farm_id หรือหาฟาร์มไม่เจอ → ใช้ฟาร์มแรกอัตโนมัติ
        if (!$selected_farm && $farms->isNotEmpty()) {
            $selected_farm = $farms->first();
        }

        // For compatibility with old view while we migrate
        $cameras = $farms; 
        $selected_camera = $selected_farm;

        $query = \App\Models\CameraAnalysis::query();
        if ($selected_farm && $selected_farm->cameras->first()) {
            $query->whereIn('camera_id', $selected_farm->cameras->pluck('id'));
        }

        $growthData = $query->where('timestamp', '>=', now()->subDays(7))
            ->orderBy('timestamp', 'asc')
            ->get();

        $labels = $growthData->map(function($item) { return \Carbon\Carbon::parse($item->timestamp)->format('d M H:i'); });
        $plant_height_values = $growthData->map(function($item) { return $item->plant_height; });
        $canopy_width_values = $growthData->map(function($item) { return $item->canopy_width; });
        $leaf_width_values = $growthData->map(function($item) { return $item->leaf_width; });
        $leaf_count_values = $growthData->map(function($item) { return $item->leaf_count; });
        $fresh_weight_with_root_values = $growthData->map(function($item) { return $item->fresh_weight_with_root; });
        
        $plants = \App\Models\Plant::withCount('analyses')
            ->with('latestAnalysis')
            ->get();

        return view('camera', compact(
            'farms',
            'cameras',
            'selected_farm',
            'selected_camera',
            'labels',
            'plant_height_values',
            'canopy_width_values',
            'leaf_width_values',
            'leaf_count_values',
            'fresh_weight_with_root_values',
            'plants'
        ));
    }

    /**
     * Store a new farm.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = auth()->id() ?? 4; // Fallback to test user

        $farm = \App\Models\Farm::create($validated);

        // Create 4 dummy cameras for the farm by default
        for ($i = 1; $i <= 4; $i++) {
            \App\Models\Camera::create([
                'user_id' => $validated['user_id'],
                'farm_id' => $farm->id,
                'name' => "กล้องสวนที่ {$i}",
                'status' => 'inactive',
                'connection_type' => 'RTSP'
            ]);
        }

        return redirect()->back()->with('success', 'เพิ่มฟาร์มใหม่และกล้อง 4 ตัวเรียบร้อยแล้ว!');
    }

    /**
     * Update camera connection details.
     */
    public function update(Request $request, $id)
    {
        $camera = Camera::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'nullable|string|max:255',
            'ip_address'      => 'nullable|string|max:255',
            'username'        => 'nullable|string|max:255',
            'password'        => 'nullable|string|max:255',
            'stream_url'      => 'nullable|string',
            'connection_type' => 'nullable|string',
        ]);

        if (isset($validated['username'])) {
            $validated['username'] = trim($validated['username']);
        }
        if (isset($validated['password'])) {
            $validated['password'] = trim($validated['password']);
        }

        // ถ้าใส่ ip_address หรือ stream_url ให้ตั้ง status เป็น active อัตโนมัติ
        if (!empty($validated['ip_address']) || !empty($validated['stream_url'])) {
            $validated['status'] = 'active';
        }

        // ลบ null values ออกเพื่อไม่ให้ overwrite ข้อมูลที่มีอยู่
        $camera->update(array_filter($validated, fn($v) => $v !== null));

        return redirect()->back()->with('success', 'อัปเดตการเชื่อมต่อกล้องเรียบร้อยแล้ว!');
    }

    /**
     * Remove a farm and its cameras.
     */
    public function destroy($id)
    {
        $farm = \App\Models\Farm::findOrFail($id);
        
        // Delete all cameras associated with this farm first
        $farm->cameras()->delete();
        
        // Delete the farm itself
        $farm->delete();

        return redirect('/camera')->with('success', 'ลบฟาร์มและกล้องทั้งหมดเรียบร้อยแล้ว');
    }

    /**
     * Helper สำหรับการ Proxy URL (เช่น MJPEG หรือ Image)
     */
    private function proxyUrl($url, $contentType)
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 5, // กำหนด Timeout สั้นลงสำหรับการตรวจสอบ
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_HEADER         => false,
            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use ($contentType) {
                static $headersSent = false;
                if (!$headersSent) {
                    header("Content-Type: {$contentType}");
                    header('Access-Control-Allow-Origin: *');
                    if (ob_get_level()) ob_end_clean();
                    $headersSent = true;
                }
                echo $data;
                flush();
                return strlen($data);
            },
        ]);
        
        $success = curl_exec($ch);
        curl_close($ch);
        
        if ($success) {
            exit; // ถ้าสตรีมสำเร็จให้จบ request ที่นี่
        }
        
        return false; // ถ้าไม่สำเร็จให้ส่งค่ากลับเพื่อให้ Loop ทำงานต่อได้
    }

    /**
     * Snapshot (JPEG) - ดึงภาพนิ่งจากกล้อง Hikvision ผ่าน Server Proxy
     */
    public function getSnapshot($id = null)
    {
        $camera = $id ? Camera::find($id) : null;

        $ip   = $camera ? $camera->ip_address : null;
        $user = ($camera && $camera->username) ? $camera->username : 'admin';
        $pass = ($camera && $camera->password) ? $camera->password : 'PitakHIK69';

        // ถ้ากล้องนี้ยังไม่ได้ตั้งค่า IP ให้ส่ง Error กลับไปเลย จะได้ไม่ไปดึงภาพมั่ว
        if (empty($ip)) {
            return response()->json(['error' => 'No IP configured for this camera'], 404);
        }

        $urls = [
            "http://{$ip}/ISAPI/Streaming/channels/102/picture",
            "http://{$ip}/ISAPI/Streaming/channels/101/picture",
            "http://{$ip}/cgi-bin/snapshot.cgi",
            "http://{$ip}/onvif-http/snapshot",
        ];

        foreach ($urls as $url) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 5,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_HTTPAUTH       => CURLAUTH_ANY,
                CURLOPT_USERPWD        => "{$user}:{$pass}",
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => false,
            ]);
            $body        = curl_exec($ch);
            $httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);

            if ($httpCode === 200 && $contentType && strpos($contentType, 'image') !== false) {
                return response($body, 200)
                    ->header('Content-Type', 'image/jpeg')
                    ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                    ->header('Access-Control-Allow-Origin', '*');
            }
        }

        // ถ้าดึงไม่ได้ ส่ง 503 กลับ
        return response()->json(['error' => 'Camera unreachable. IP: '.$ip], 503);
    }

    /**
     * MJPEG Stream Proxy - สตรีมวิดีโอต่อเนื่องผ่าน Server (multipart/x-mixed-replace)
     * ใช้ <img src="/camera/live/{id}"> ได้เลยโดยไม่ต้อง JavaScript refresh
     */
    public function streamMjpeg($id = null)
    {
        $camera = $id ? Camera::find($id) : null;
        if (!$camera) abort(404);

        $ip   = $camera->ip_address ?? $this->cameraIp;
        $user = $camera->username   ?? ($this->username ?: 'admin');
        $pass = $camera->password   ?? ($this->password ?: 'PitakHIK69');

        // ปิด Buffering และ Compression ทั้งหมดทันที เพื่อให้ Stream ออกไว
        @ini_set('zlib.output_compression', 0);
        @ini_set('implicit_flush', 1);
        while (ob_get_level()) ob_end_clean();

        // ส่ง Header ก่อนเริ่ม Stream (ไม่ต้องรอให้ curl ทำงานก่อน)
        header('Content-Type: multipart/x-mixed-replace; boundary=--myboundary');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('X-Accel-Buffering: no');
        header('Connection: keep-alive');
        flush();

        // MJPEG endpoints สำหรับ Hikvision (ลองตามลำดับ)
        $urls = [
            "http://{$ip}/ISAPI/Streaming/channels/102/httppreview",
            "http://{$ip}/ISAPI/Streaming/channels/101/httppreview",
            "http://{$ip}/Streaming/channels/2/httppreview",
            "http://{$ip}/Streaming/channels/1/httppreview",
        ];

        foreach ($urls as $url) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_TIMEOUT        => 0,    // ไม่ตัด connection
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_HTTPAUTH       => CURLAUTH_DIGEST, // Hikvision ใช้ Digest Auth
                CURLOPT_USERPWD        => "{$user}:{$pass}",
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_BUFFERSIZE     => 128,  // Buffer เล็กๆ เพื่อส่งทันที
                CURLOPT_WRITEFUNCTION  => function ($ch, $data) {
                    echo $data;
                    flush();
                    return strlen($data);
                },
            ]);

            curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($code === 200) exit;
        }

        // Fallback: ถ้า MJPEG ไม่ได้ ให้ดึง Snapshot แทน
        return $this->getSnapshot($id);
    }
}
