import {AfterViewInit, Component, ElementRef, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {FormsModule} from "@angular/forms";
import {WebsocketService} from "../../services/websocket/web-socket.service";
import {Message} from "../../types";
import {AuthService} from "../../services/auth/auth-service.service";

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatInput') chatInputRef!: ElementRef<HTMLTextAreaElement>;
  private chatService: ChatService = inject(ChatService);
  private webSocketService = inject(WebsocketService);
  public authService: AuthService = inject(AuthService);
  public newMessage = signal('');
  public chatId = signal(-1);
  public messages = signal<Message[] | null>(null);

  ngOnInit(): void {
    // Chat erstellen

    // websocket topic subscriben
    this.webSocketService.subscribe(`topic/chat/${this.chatId()}`).subscribe(chat => {

    });
  }

  ngAfterViewInit(): void {
    // Beim Laden fokussieren
    this.chatInputRef.nativeElement.focus();
  }

  sendMessage(message: string) {
    console.log(message);
    //this.chatService.sendMessage(0, message); // TODO ChatId bekommenE
  }

  // Damit Enter die Nachricht sendet und kein Zeilenumbruch hinzufügt und Shift + Enter eine neue Zeile hinzufügt
  sendMessageWrapper(event: Event) {
    // Nur Enter ohne Shift schickt Nachricht ab
    const kEvent = event as KeyboardEvent;
    if(!kEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage(this.newMessage());
      this.newMessage.set('');
    }
  }

  protected readonly KeyboardEvent = KeyboardEvent;
}
