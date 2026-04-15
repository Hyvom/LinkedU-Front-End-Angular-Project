import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../core/services/quiz.service';

@Component({
  selector: 'app-student-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-quiz.component.html'
})
export class StudentQuizComponent implements OnInit, OnDestroy {
  quiz: any; // Data from your API
  remainingTime: string = '';
  progressPercent: number = 0;
  quizStatus: 'Upcoming' | 'Active' | 'Expired' = 'Upcoming';
  private timerSubscription: any;

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.loadQuiz(); // This should fetch the quiz including startTime/endTime
    // Start monitoring the clock every second
    this.updateQuizStatus(); // Initial call to avoid 1s delay
    this.timerSubscription = setInterval(() => {
      this.updateQuizStatus();
    }, 1000);
  }

  loadQuiz() {
    // Ensure this.quiz is loaded with startTime and endTime from your API
  }

  updateQuizStatus() {
    const startVal = this.quiz?.startTime || this.quiz?.start_time || this.quiz?.startDate || this.quiz?.start;
    const endVal = this.quiz?.endTime || this.quiz?.end_time || this.quiz?.endDate || this.quiz?.end;

    if (!startVal || !endVal) return;

    const now = new Date().getTime();
    const start = new Date(startVal).getTime();
    const end = new Date(endVal).getTime();

    if (now < start) {
      this.quizStatus = 'Upcoming';
      const diff = start - now;
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.remainingTime = `Starts in ${m}m ${s}s`;
      this.progressPercent = 0;
    } else if (now >= end) {
      if (this.quizStatus !== 'Expired') {
        this.quizStatus = 'Expired';
        this.remainingTime = 'Time Expired';
        this.progressPercent = 100;
        this.autoSubmit();
      }
    } else {
      this.quizStatus = 'Active';
      const diff = end - now;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.remainingTime = `${m}:${s.toString().padStart(2, '0')}`;
      
      const totalDuration = end - start;
      const elapsed = now - start;
      this.progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
  }

  autoSubmit() {
    console.warn("Time expired. Submitting quiz...");
    // Important: Call your existing submit logic here
    this.finishQuiz(); 
  }

  finishQuiz() {
    if (this.quizStatus === 'Upcoming') {
      console.error("Cannot submit: Quiz hasn't started yet.");
      return;
    }

    // Your logic to send answers to the backend
    console.log("Quiz submitted successfully.");
    if (this.quizStatus === 'Expired') {
      alert("Time is up! Your quiz has been submitted automatically.");
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
    }
  }
}