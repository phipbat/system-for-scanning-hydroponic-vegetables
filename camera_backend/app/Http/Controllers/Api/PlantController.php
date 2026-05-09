<?php
// ไฟล์สำหรับ Api/PlantController (จัดการข้อมูลแปลงผักและข้อมูลพืชผ่าน API)

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Plant::where('user_id', auth()->id())
                ->withCount('analyses')
                ->with('latestAnalysis')
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'system_type' => 'nullable|string',
            'ph_target' => 'nullable|numeric',
            'ec_target' => 'nullable|numeric',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'growing';

        $plant = Plant::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $plant
        ], 201);
    }

    public function show($id)
    {
        $plant = Plant::where('user_id', auth()->id())
            ->with(['analyses' => function ($query) {
                $query->orderBy('timestamp', 'desc');
            }])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $plant
        ]);
    }

    public function update(Request $request, $id)
    {
        $plant = Plant::findOrFail($id);
        $plant->update($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $plant
        ]);
    }

    public function destroy($id)
    {
        $plant = Plant::findOrFail($id);
        $plant->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Plant deleted'
        ]);
    }
}
