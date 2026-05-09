<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use Illuminate\Http\Request;

class CameraWebController extends Controller
{
    /**
     * Display a listing of the cameras.
     */
    public function index()
    {
        $cameras = Camera::orderBy('created_at', 'desc')->get();
        return view('cameras', compact('cameras'));
    }

    /**
     * Store a newly created camera in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'stream_url' => 'nullable|string',
        ]);

        $farmId = \App\Models\Farm::first()->id ?? 1;

        Camera::create([
            'farm_id' => $farmId, // Dynamic fallback
            'name' => $request->name,
            'stream_url' => $request->stream_url ?? '',
            'status' => 'active'
        ]);

        return redirect()->back()->with('success', 'เพิ่มกล้องใหม่เรียบร้อยแล้ว');
    }

    /**
     * Remove the specified camera from storage.
     */
    public function destroy($id)
    {
        $camera = Camera::findOrFail($id);
        $camera->delete();
        
        return redirect()->back()->with('success', 'ลบกล้องเรียบร้อยแล้ว');
    }
}
