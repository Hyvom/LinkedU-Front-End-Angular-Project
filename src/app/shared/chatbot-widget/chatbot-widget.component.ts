import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ChatbotService } from '../../core/services/chatbot.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent {
  isOpen = false;
  isLoading = false;
  question = '';
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: 'Hi! I answer only from LinkedU website information.'
    }
  ];

  constructor(private readonly chatbotService: ChatbotService) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const trimmedQuestion = this.question.trim();
    if (!trimmedQuestion || this.isLoading) {
      return;
    }

    this.messages.push({ role: 'user', content: trimmedQuestion });
    this.question = '';
    this.isLoading = true;

    this.chatbotService
      .ask(trimmedQuestion)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((reply) => {
        this.messages.push({ role: 'assistant', content: reply });
      });
  }
}
