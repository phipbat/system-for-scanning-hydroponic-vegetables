<?php
// ไฟล์สำหรับเส้นทางเว็บไซต์ (Web Routes) - สำหรับหน้า Dashboard และหน้าจัดการผ่าน Browser

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\GrowthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;

// เส้นทาง Auth สำหรับระบบเว็บ (Auth Routes)
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'webLogin']);
Route::post('/logout', [AuthController::class, 'webLogout'])->name('logout');

// Protected Dashboard Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/home', function() {
        return redirect('/');
    });
    Route::get('/Home', function() {
        return redirect('/');
    });

    // ติดตามการเจริญเติบโต
    Route::get('/growth', [GrowthController::class, 'index'])->name('growth.index');
    Route::get('/growth/{id}', [GrowthController::class, 'show'])->name('growth.show');

    Route::get('/history', [HistoryController::class, 'index']);
    Route::get('/history/chat/{id}', [HistoryController::class, 'showChat'])->name('history.chat.show');
    Route::post('/history/chat/{id}/message', [HistoryController::class, 'sendMessage'])->name('history.chat.message');
    Route::delete('/history/analysis/{id}', [HistoryController::class, 'destroyAnalysis'])->name('history.analysis.destroy');
    Route::delete('/history/chat/{id}', [HistoryController::class, 'destroyChat'])->name('history.chat.destroy');
    
    // User Profile
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::post('/profile/update', [ProfileController::class, 'update']);
    Route::post('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('/profile/image', [ProfileController::class, 'deleteImage']);

    // Camera Management
    Route::get('/cameras', [\App\Http\Controllers\CameraWebController::class, 'index'])->name('cameras.index');
    Route::post('/cameras', [\App\Http\Controllers\CameraWebController::class, 'store'])->name('cameras.store');
    Route::delete('/cameras/{id}', [\App\Http\Controllers\CameraWebController::class, 'destroy'])->name('cameras.destroy');

});
