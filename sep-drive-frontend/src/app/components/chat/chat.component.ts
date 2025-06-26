import {AfterViewInit, Component, ElementRef, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {FormsModule} from "@angular/forms";
import {WebsocketService} from "../../services/websocket/web-socket.service";
import {Message, RideOffer} from "../../types";
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
  public chatId = signal(-1);
  public messages = signal<Message[] | null>(null);

  ngOnInit(): void {
    if (this.authService.user()?.role === 'CUSTOMER') {
      // über authService userId
      const customerId = this.authService.user()!.id;

      // über lastclickedRideOfferId die rideOffer
      // Wenn der wir vom Customer kommen ist rideOfferId immer gesetzt daher rideOfferId!
      // über rideOffer driverId
      // checken ob chat existiert mit customerId und driverId
      this.rideOfferService.getRideOfferById(this.rideOfferId!).pipe(
          switchMap((rideOffer: RideOffer) =>
              this.chatService.getChatsByUsers(customerId, rideOffer.driverId)
          )
      ).subscribe({
        next: result => {
          this.chatId.set(result.id);
        },
        error: err => {
          console.log('Fehler beim Laden des RideOffer oder Chat', err);

        }
      });
      // sonst createChat
    } else { // Driver
      // über userId openRideOffer
      // über rideOffer customerId
      // checken ob chat existiert mit customerId und driverId
      // sonst createChat
    }

    // websocket topic subscriben - für alle gleich
    this.webSocketService.subscribe(`topic/chat/${this.chatId()}`).subscribe(chat => {

    });
  }

  ngAfterViewInit(): void {
    // Beim Laden Textarea fokussieren
    this.chatInputRef.nativeElement.focus();
  }

  sendMessage(message: string) {
    console.log(message);
    //this.chatService.sendMessage(0, message); // TODO ChatId bekommen
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
