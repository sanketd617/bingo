import { Component, OnInit } from '@angular/core';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  title = 'Bingo';
  faGoogleIcon = faGoogle;

  user = null;
  opponent = null;
  game: Observable<any>;

  constructor(public auth: AuthService, private afs: AngularFirestore, private router: Router) {
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });
  }

  create() {
    this.afs.collection('games').add({
      p1: {
        id: this.user.uid,
        score: 0,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      p2: {
        id: null,
        score: 0,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      crossed: [],
      turn: 'p1'
    }).then((response) => {
      this.router.navigate(['game/' + response.id]);
    }).catch((error) => {
      console.error(error);
    });
  }
}
