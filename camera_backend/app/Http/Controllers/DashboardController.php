<?php
// ไฟล์สำหรับ DashboardController (จัดการข้อมูลสถิติรวมสำหรับหน้าเว็บไซต์หลัก)

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plant;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_analyses' => 0,
            'today_analyses' => 0,
            'total_plants'   => Plant::count(),
            'active_cameras' => 0,
        ];

        $latest_plant = Plant::orderBy('updated_at', 'desc')->first();
        
        $latest_analysis = null;

        return view('home', compact('stats', 'latest_analysis', 'latest_plant'));
    }
}
