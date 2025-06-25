import {Component, inject, Input, OnInit} from '@angular/core';
import {ChatService} from "../../services/chat.service";

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  //@Input() rideOfferId: number = -1;
  private chatService: ChatService = inject(ChatService);

  ngOnInit(): void {
    // Chat erstellen

  }
}
