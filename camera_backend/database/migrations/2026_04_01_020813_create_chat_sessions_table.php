<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatSessionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->string('id')->primary(); // Use string ID to accommodate mobile-generated IDs (e.g., sess_123456)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('last_message')->nullable();
            $table->bigInteger('timestamp'); // To match mobile's Date.now()
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('chat_sessions');
    }
}
