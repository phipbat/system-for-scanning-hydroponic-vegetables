<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->string('id')->primary(); // Match mobile-generated IDs (e.g. Date.now().toString())
            $table->string('chat_session_id');
            $table->foreign('chat_session_id')->references('id')->on('chat_sessions')->onDelete('cascade');
            $table->text('text');
            $table->enum('sender', ['user', 'bot']);
            $table->string('image_path')->nullable();
            $table->bigInteger('timestamp');
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
        Schema::dropIfExists('chat_messages');
    }
}
