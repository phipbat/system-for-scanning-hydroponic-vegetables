<?php
// ไฟล์สำหรับ GrowthController (จัดการข้อมูลการเจริญเติบโตของพืช กราฟ และแสดงผลรายละเอียด)

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plant;
use App\Models\CameraAnalysis;
use Carbon\Carbon;

class GrowthController extends Controller
{
    /**
     * หน้ารายการแปลงผักทั้งหมด (Level 1)
     */
    public function index()
    {
        $plants = Plant::withCount('analyses')
            ->with(['user', 'latestAnalysis'])
            ->orderBy('created_at', 'desc')
            ->get();

        return view('growth', compact('plants'));
    }

    /**
     * หน้ารายละเอียดแปลงและกราฟ (Level 2)
     */
    public function show($id)
    {
        $plant = Plant::with(['user', 'latestAnalysis'])->withCount('analyses')->findOrFail($id);

        // ดึง analyses ย้อนหลัง 30 วัน เรียงจากเก่า→ใหม่ สำหรับกราฟ
        $analyses = CameraAnalysis::where('plant_id', $plant->id)
            ->where('timestamp', '>=', now()->subDays(30))
            ->orderBy('timestamp', 'asc')
            ->get();

        // ดึง timeline ล่าสุด 20 รายการ (เรียงใหม่→เก่า)
        $timeline = CameraAnalysis::where('plant_id', $plant->id)
            ->orderBy('timestamp', 'desc')
            ->take(20)
            ->get();

        // จัดข้อมูลสำหรับกราฟ
        $labels                    = $analyses->map(function ($a) {
            return Carbon::parse($a->timestamp)->format('d/m H:i');
        })->values();
        $plant_height_values       = $analyses->map(function ($a) { return $a->plant_height; })->values();
        $canopy_width_values       = $analyses->map(function ($a) { return $a->canopy_width; })->values();
        $leaf_width_values         = $analyses->map(function ($a) { return $a->leaf_width; })->values();
        $leaf_count_values         = $analyses->map(function ($a) { return $a->leaf_count; })->values();
        $fresh_weight_values       = $analyses->map(function ($a) { return $a->fresh_weight_with_root; })->values();
        $ph_values                 = $analyses->map(function ($a) { return $a->ph_value; })->values();
        $ec_values                 = $analyses->map(function ($a) { return $a->ec_value; })->values();

        return view('growth_detail', compact(
            'plant', 'timeline', 'labels',
            'plant_height_values', 'canopy_width_values',
            'leaf_width_values', 'leaf_count_values',
            'fresh_weight_values', 'ph_values', 'ec_values'
        ));
    }
}
