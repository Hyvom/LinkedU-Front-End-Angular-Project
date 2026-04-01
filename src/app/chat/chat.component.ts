import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../core/services/chat.service';
import { AgentService } from '../core/services/agent.service';
import { AuthService } from '../core/services/auth.service';
import { ChatMessage, AssignedStudent } from '../shared/models/models';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface ChatContact {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  unreadCount: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  private readonly platformId = inject(PLATFORM_ID);
  // ── Auth ──
  currentUserId = 0;
  currentUserRole = '';

  // ── Contacts ──
  contacts: ChatContact[] = [];
  isLoadingContacts = true;
  selectedContact: ChatContact | null = null;

  // ── Messages ──
  messages: ChatMessage[] = [];
  isLoadingMessages = false;
  newMessage = '';
  isSending = false;

  // ── Polling ──
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private shouldScrollToBottom = false;

  // ── Unread ──
  unreadCounts: Record<number, number> = {};

  constructor(
    private readonly chatService: ChatService,
    private readonly agentService: AgentService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentUserId = Number(this.authService.getUserId());
    this.currentUserRole = this.authService.getUserRole()?.toUpperCase() || '';
    if (!this.currentUserId) return;
    this.loadContacts();
    this.startUnreadPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // ── Contacts ──
  loadContacts(): void {
    this.isLoadingContacts = true;

    if (this.currentUserRole === 'AGENT') {
      // Agent sees their assigned students
      this.agentService.getMyStudents(this.currentUserId).subscribe({
        next: (students) => {
          this.contacts = students.map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            role: 'STUDENT',
            unreadCount: 0
          }));
          this.isLoadingContacts = false;
          this.loadUnreadCounts();
        },
        error: () => { this.isLoadingContacts = false; }
      });
    } else {
      // Student/Guest sees their assigned agent via profile
      this.loadAgentContact();
    }
  }

  loadAgentContact(): void {
    // Get agent from student profile's assignedAgent
    this.agentService.getStudentProfile(this.currentUserId).subscribe({
      next: (profile) => {
        const user = profile?.user;
        if (user?.assignedAgent) {
          this.contacts = [{
            id: user.assignedAgent.id,
            firstName: user.assignedAgent.firstName,
            lastName: user.assignedAgent.lastName,
            username: user.assignedAgent.username || 'agent',
            role: 'AGENT',
            unreadCount: 0
          }];
        } else {
          this.contacts = [];
        }
        this.isLoadingContacts = false;
        this.loadUnreadCounts();
      },
      error: () => { this.isLoadingContacts = false; }
    });
  }

  getInitials(contact: ChatContact): string {
    return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
  }

  // ── Select Contact ──
  selectContact(contact: ChatContact): void {
    this.selectedContact = contact;
    this.messages = [];
    this.newMessage = '';
    this.stopPolling();
    this.loadMessages();
    this.startMessagePolling();
  }

  // ── Messages ──
  loadMessages(): void {
    if (!this.selectedContact) return;
    this.isLoadingMessages = true;

    this.chatService.getConversation(this.currentUserId, this.selectedContact.id).subscribe({
      next: (msgs) => {
        const wasEmpty = this.messages.length === 0;
        this.messages = msgs;
        this.isLoadingMessages = false;
        if (wasEmpty) this.shouldScrollToBottom = true;
        this.markUnseenAsRead(msgs);
        this.updateUnreadCount(this.selectedContact!.id, 0);
      },
      error: () => { this.isLoadingMessages = false; }
    });
  }

  markUnseenAsRead(msgs: ChatMessage[]): void {
    msgs
      .filter(m => !m.seen && m.receiver?.id === this.currentUserId)
      .forEach(m => {
        this.chatService.markAsSeen(m.id).subscribe();
      });
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.selectedContact || this.isSending) return;

    this.isSending = true;
    this.newMessage = '';

    this.chatService.sendMessage(this.currentUserId, this.selectedContact.id, text).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.shouldScrollToBottom = true;
        this.isSending = false;
      },
      error: () => { this.isSending = false; this.newMessage = text; }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isMine(msg: ChatMessage): boolean {
    return msg.sender?.id === this.currentUserId;
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  shouldShowDate(index: number): boolean {
    if (index === 0) return true;
    const prev = new Date(this.messages[index - 1].timestamp);
    const curr = new Date(this.messages[index].timestamp);
    return prev.toDateString() !== curr.toDateString();
  }

  scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  // ── Polling ──
  startMessagePolling(): void {
    this.pollingInterval = setInterval(() => {
      if (this.selectedContact) {
        this.chatService.getConversation(this.currentUserId, this.selectedContact.id).subscribe({
          next: (msgs) => {
            if (msgs.length !== this.messages.length) {
              this.messages = msgs;
              this.shouldScrollToBottom = true;
              this.markUnseenAsRead(msgs);
            }
          }
        });
      }
    }, 3000); // Poll every 3 seconds
  }

  startUnreadPolling(): void {
    setInterval(() => {
      this.loadUnreadCounts();
    }, 10000);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // ── Unread ──
  loadUnreadCounts(): void {
    this.chatService.getUnreadMessages(this.currentUserId).subscribe({
      next: (unread) => {
        this.unreadCounts = {};
        unread.forEach(msg => {
          const senderId = msg.sender?.id;
          if (senderId) {
            this.unreadCounts[senderId] = (this.unreadCounts[senderId] || 0) + 1;
          }
        });
        this.contacts.forEach(c => {
          c.unreadCount = this.unreadCounts[c.id] || 0;
        });
      }
    });
  }

  updateUnreadCount(contactId: number, count: number): void {
    this.unreadCounts[contactId] = count;
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) contact.unreadCount = count;
  }

  getTotalUnread(): number {
    return Object.values(this.unreadCounts).reduce((a, b) => a + b, 0);
  }
}