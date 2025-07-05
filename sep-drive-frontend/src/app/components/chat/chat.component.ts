import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {ChatService} from "../../services/chat/chat.service";
import {FormsModule} from "@angular/forms";
import {WebsocketService} from "../../services/websocket/web-socket.service";
import {Chat, Message, RideOffer} from "../../types";
import {AuthService} from "../../services/auth/auth-service.service";
import {RideofferService} from "../../services/rideoffer/rideoffer.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('rideOfferId') rideOfferId: number | null = null; // Nur gesetzt, wenn man aus Kunden-View kommt
  @ViewChild('chatInput') chatInputRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesContainer') messagesContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('editInput') editInputRef!: ElementRef<HTMLInputElement>;

  private chatService: ChatService = inject(ChatService);
  private webSocketService = inject(WebsocketService);
  private rideOfferService: RideofferService = inject(RideofferService);
  public authService: AuthService = inject(AuthService);

  private sub?: Subscription;
  public editingMessage: Message | null = null;
  public editedMessageText: string = '';

  public newMessage = signal('');
  public chatId = signal<number | null>(null);
  public messages = signal<Message[] | null>(null);

  constructor() {
    this.scrollToBottom();
  }

  ngOnInit(): void {
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
      error: _ => {
        // Chat existiert nicht
        this.chatService.createChat(customerId, driverId).subscribe({
          next: (chatId: number) => {
            // Chat existiert nach dem Erstellen
            this.chatService.getChat(chatId).subscribe({
              next: (chat: Chat) => {
                this.chatId.set(chat.id);
                this.loadMessages(chat);
                this.subscribeToChat(chat);
              }
            })
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
    this.sub = this.webSocketService.subscribe<Chat>('/topic/chat/' + chat.id).subscribe({
      next: (chat) => {
        this.loadMessages(chat);
      }
    });
  }

  // Wird aufgerufen, wenn das HTML gerendert ist. Erst dann kann man auf die Objekte zugreifen
  ngAfterViewInit(): void {
    // Beim Laden Textarea fokussieren
    this.chatInputRef.nativeElement.focus(); // Mit nativeElement bekommt man das echte DOM Objekt vom Typ HTMLTextAreaElement
  }

  ngOnDestroy(): void {
    // Bei Verlassen der Komponente Subscription abbrechen
    this.sub?.unsubscribe();
  }

  sendMessage() {
    const message = this.newMessage();
    const trimmed = message.trim();
    if (!trimmed) return; // Verhindere Leertext

    if (!this.chatId()) {
      console.warn('Konnte Nachricht nicht senden, weil chatId noch nicht gesetzt ist');
      return;
    }

    this.chatService.sendMessage(this.chatId()!, trimmed).subscribe({
      next: _ => {
        this.chatService.getChat(this.chatId()!).subscribe({
          next: chat => {
            this.loadMessages(chat);
          }
        });
        this.newMessage.set('');
      }
    });
  }

  /**
   * Damit Enter die Nachricht sendet und kein Zeilenumbruch hinzufügt und Shift + Enter eine neue Zeile hinzufügt
   */
  sendMessageWrapper(event: Event) {
    // Nur Enter ohne Shift schickt Nachricht ab
    const kEvent = event as KeyboardEvent;
    if(!kEvent.shiftKey) {
      event.preventDefault(); // Verhindert, dass eine neue Zeile hinzugefügt wird
      this.sendMessage();
    }
  }

  startEdit(message: Message) {
    this.editingMessage = message;
    this.editedMessageText = message.message;
    setTimeout(() => {
      this.editInputRef?.nativeElement?.focus();
    });
  }

  cancelEdit() {
    this.editingMessage = null;
    this.editedMessageText = '';
  }

  saveEditedMessage(message: Message) {
    const trimmed = this.editedMessageText.trim();
    if (!trimmed) return; // Optional: Verhindere Leertext

    this.chatService.editMessage(this.chatId()!, message.id, trimmed).subscribe({
      next: () => {
        // Nach erfolgreichem Edit mit aktuellen Nachrichten aktualisieren
        this.chatService.getChat(this.chatId()!).subscribe(chat => this.loadMessages(chat));
        this.cancelEdit();
      },
      error: err => {
        alert('Bearbeiten fehlgeschlagen: ' + (err?.error ?? err));
        this.cancelEdit(); // Schließt die Edit-View, z.B. wenn ein User eine Nachricht bearbeitet, der andere User die Nachricht erst sieht, wenn der andere schon in der Edit-View ist
      }
    });
  }

  deleteMessage(message: Message) {
    this.chatService.deleteMessage(this.chatId()!, message.id).subscribe({
      next: () => this.chatService.getChat(this.chatId()!).subscribe(c => this.loadMessages(c))
    });
  }

  private loadMessages(chat: Chat): void {
    this.messages.set(chat.messages);

    // Gelesen markieren (nur empfangene, ungelesene Nachrichten)
    const currentUserRole = this.authService.user()?.role;
    if (!currentUserRole) return;

    if (chat.messages && this.chatId()) {
      chat.messages.forEach(message => {
        if (message.senderRole !== currentUserRole && !message.seen) { // empfangen und noch nicht gelesen
          this.chatService.markAsRead(this.chatId()!, message.id).subscribe();
        }
      });
    }
    this.scrollToBottom();
  }

  /**
   * Scroll den Message Container immer nach unten, damit die neue Nachricht zu sehen ist.
   */
  private scrollToBottom(): void {
    // Das setTimeout() verschiebt den Callback auf den nächsten Tick in der Event-Queue von JavaScript
    // Trick, um asynchron auf das vollständige Rendern der View zu warten
    setTimeout(() => {
      if (this.messagesContainerRef?.nativeElement) {
        this.messagesContainerRef.nativeElement.scrollTop = this.messagesContainerRef.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
