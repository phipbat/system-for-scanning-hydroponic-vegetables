<?php
// ไฟล์สำหรับเส้นทาง API (API Routes) - สำหรับการเชื่อมต่อกับ Mobile App และอุปกรณ์ต่างๆ

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CameraController;
use App\Http\Controllers\Api\PlantController;

// เส้นทาง API สาธารณะ (ไม่ต้องยืนยันตัวตน)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::get('/camera/snapshot/{id?}', [CameraController::class, 'getSnapshot']);
Route::get('/camera/mjpeg/{id?}', [CameraController::class, 'mjpegStream']);
Route::get('/camera/live-viewer/{id?}', [CameraController::class, 'liveViewer']);
Route::post('/camera/auto-analysis', [CameraController::class, 'autoAnalysis']); // Python scheduler เรียก (ป้องกันด้วย secret key)


// Protected API Routes
Route::middleware('auth:sanctum')->group(function () {
    // ระบบจัดการกล้องและการวิเคราะห์
    Route::get('/camera-alerts', [CameraController::class, 'getAnalyses']); // ดึงประวัติ CameraAnalysis (กรองด้วย ?camera_id=)
    Route::get('/cameras', [CameraController::class, 'index']);
    Route::post('/cameras', [CameraController::class, 'store']);
    Route::delete('/cameras/{id}', [CameraController::class, 'destroy']);
    Route::post('/camera/sync-analysis', [CameraController::class, 'syncAnalysis']);
    Route::delete('/camera/sync-analysis/{id}', [CameraController::class, 'destroyAnalysis']);
    Route::post('/camera/check-deleted-analysis', [CameraController::class, 'checkDeletedAnalysis']);
    // User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/user/push-token', [AuthController::class, 'updatePushToken']);

    
    // Camera Alerts & History
    
    // Plant Management
    Route::apiResource('plants', \App\Http\Controllers\Api\PlantController::class);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);

    // AI Chat Sync
    Route::get('/chats', [\App\Http\Controllers\Api\ChatController::class, 'index']);
    Route::get('/chats/{id}', [\App\Http\Controllers\Api\ChatController::class, 'show']);
    Route::post('/chats/sync', [\App\Http\Controllers\Api\ChatController::class, 'sync']);
    Route::delete('/chats/{id}', [\App\Http\Controllers\Api\ChatController::class, 'destroy']);
});

