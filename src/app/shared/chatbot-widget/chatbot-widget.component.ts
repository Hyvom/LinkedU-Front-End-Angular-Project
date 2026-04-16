import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  
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

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    // Scroll to bottom when opening the chat
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    const trimmedMessage = this.question.trim();
    if (!trimmedMessage || this.isLoading) return;

    this.messages.push({ role: 'user', content: trimmedMessage });
    this.question = '';
    this.isLoading = true;

    this.chatbotService
      .ask(trimmedMessage)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (reply) => {
          this.messages.push({ role: 'assistant', content: reply });
        },
        error: (err) => {
          console.error('Chatbot error:', err);
          this.messages.push({ 
            role: 'assistant', 
            content: 'Sorry, I encountered an error. Please try again later.' 
          });
        }
      });
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}