<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationHelper
{
    /**
     * ส่งการแจ้งเตือนไปยังเครื่องมือถือผ่าน Expo Push API
     *
     * @param string $toToken รหัส Push Token ของเครื่องผู้รับ
     * @param string $title หัวข้อแจ้งเตือน
     * @param string $body เนื้อหาแจ้งเตือน
     * @param array $data ข้อมูลเพิ่มเติม (Optional)
     * @return bool
     */
    public static function send($toToken, $title, $body, $data = [])
    {
        // ถ้าไม่มี Token ให้ข้ามไป
        if (empty($toToken)) {
            return false;
        }

        try {
            $response = Http::post('https://exp.host/--/api/v2/push/send', [
                'to'    => $toToken,
                'title' => $title,
                'body'  => $body,
                'data'  => $data,
                'sound' => 'default',
                'badge' => 1,
            ]);

            if ($response->successful()) {
                return true;
            } else {
                Log::error('Expo Push Error: ' . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Push Notification Exception: ' . $e->getMessage());
            return false;
        }
    }
}
