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
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crossed: []
      },
      p2: {
        id: null,
        board: [],
        crossed: []
      },
      turn: null
    }).then((response) => {
      this.router.navigate(['game/' + response.id]);
    }).catch((error) => {
      console.error(error);
    });
  }

  join() {
    Swal.fire({
      title: 'Enter friend\'s username:',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Join',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        return fetch(`//api.github.com/users/${login}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText)
            }
            return response.json()
          })
          .catch(error => {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: `${result.value.login}'s avatar`,
          imageUrl: result.value.avatar_url
        })
      }
    })
  }

}
