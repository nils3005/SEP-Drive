import {AfterViewInit, Component, ElementRef, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {FormsModule} from "@angular/forms";
import {WebsocketService} from "../../services/websocket/web-socket.service";
import {Chat, Message, RideOffer} from "../../types";
import {AuthService} from "../../services/auth/auth-service.service";
import {RideofferService} from "../../services/rideoffer/rideoffer.service";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input('rideOfferId') rideOfferId: number | null = null;
  @ViewChild('chatInput') chatInputRef!: ElementRef<HTMLTextAreaElement>;

  private chatService: ChatService = inject(ChatService);
  private webSocketService = inject(WebsocketService);
  private rideOfferService: RideofferService = inject(RideofferService);
  public authService: AuthService = inject(AuthService);

  public newMessage = signal('');
  public chatId = signal<number | null>(null);
  public messages = signal<Message[] | null>(null);

  ngOnInit(): void {
    console.log('Hello from chatOnInit');
    // Aus der RideOffer holt man sich entsprechend die Id des anderen Users
    if (this.authService.user()?.role === 'CUSTOMER') {
      this.handleChatForCustomer()
    } else {
      // Driver
      this.handleChatForDriver()
    }
  }

  private handleChatForCustomer(): void {
    // this.rideOfferId ist nur gesetzt, wenn der Kunde den Chat öffnet
    this.rideOfferService.getRideOfferById(this.rideOfferId!).subscribe({
      next: (rideOffer: RideOffer) => {
        this.handleChatForAllUsers(rideOffer.customerId, rideOffer.driverId);
      }
    })
  }

  private handleChatForDriver(): void {
    // Wenn der Fahrer den Chat öffnet müssen wir die rideOfferId vom Server mit der driverId holen
    this.rideOfferService.getPendingOfferForDriver(this.authService.user()!.id).subscribe({
      next: (rideOffer: RideOffer) => {
        this.handleChatForAllUsers(rideOffer.customerId, rideOffer.driverId);
      }
    });
  }

  private handleChatForAllUsers(customerId: number, driverId: number): void {
    this.chatService.getChatsByUsers(customerId, driverId).subscribe({
      next: chat => {
        // Chat existiert
        this.chatId.set(chat.id);
        this.loadMessages(chat);
        this.subscribeToChat(chat);
      },
      error: err => {
        // Chat existiert nicht
        this.chatService.createChat(customerId, driverId).subscribe({
          next: chat => {
            // Chat existiert nach dem Erstellen
            this.chatId.set(chat.id);
            this.loadMessages(chat);
            this.subscribeToChat(chat);
          },
          error: err => {
            console.log('Chat konnte nicht erstellt werden', err)
            this.chatId.set(null);
          }
        });

      }
    })
  }

  private subscribeToChat(chat: Chat): void {
    this.webSocketService.subscribe<Chat>('/topic/chat/' + chat.id).subscribe({
      next: (chat) => {
        this.loadMessages(chat);
      }
    });
  }

  ngAfterViewInit(): void {
    // Beim Laden Textarea fokussieren
    this.chatInputRef.nativeElement.focus();
  }

  sendMessage(message: string) {
    console.log(message, this.chatId()!);
    this.chatService.sendMessage(this.chatId()!, message).subscribe({
      next: _ => {
        this.chatService.getChat(this.chatId()!).subscribe({
          next: chat => {
            this.loadMessages(chat);
          }
        })
      }
    });
  }

  private loadMessages(chat: Chat): void {
    console.log('Messages:', chat.messages);
    this.messages.set(chat.messages);
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
}
