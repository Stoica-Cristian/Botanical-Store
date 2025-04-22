# Aplicație Web de E-commerce - Magazin Online

## Prezentare Generală

Tema proiectului este un magazin online de plante. Am încercat să implementez funcţionalităţile de bază pentru un astfel de site. Nu am finalizat tot, v-am descris mai jos în detaliu. Site ul este responsive, mai puţin partea de admin. Nu am găsit probleme.

## Tehnologii Utilizate

- **React + Typescript + Vite**
- **Tailwind CSS** și **DaisyUI** - pentru stilizare și componente vizuale
- **Heroicons** și **React Icons** - pentru iconițe și elemente grafice
- **Chart.js** și **React-Chartjs-2** - pentru vizualizarea datelor

## Structura Aplicației

Aplicația include următoarele funcționalități principale:

1. **Pagină Dashboard** - informații despre magazin, produse noi, newsletter, etc
2. **Pagină Magazin** - listează toate produsele cu opțiuni de filtrare și sortare
3. **Detalii Produs** - informații detaliate despre produs, specificații, recenzii
4. **Coș de Cumpărături** - gestionarea produselor selectate pentru achiziție
5. **Profil Utilizator** - informații personale, istoric comenzi, adrese și plăți
6. **Setări Utilizator** - permite modificarea parolei şi a altor setări
7. **Autentificare și Înregistrare**
8. **Secțiune Admin** - panou de vizualizare statistici şi administrare pentru gestionarea produselor, comenzilor și utilizatorilor
9. **Pagini Informative** - despre noi, contact, întrebări frecvente
10. **Pagină 404** - tratarea erorilor de navigare

## Cum să Rulezi Aplicația

1. Clonează repository-ul
2. Instalează dependențele: `npm install`
3. Pornește serverul de dezvoltare: `npm run dev`
4. Accesează aplicația în browser la adresa: `http://localhost:5173`

## Roluri utilizatori: Guest, Customer, Admin

Am hardcodat doua conturi: unul de customer(user) si unul de admin.

La deschiderea paginii de Login aveti in josul paginii optiuni pentru a va putea conecta ca unul dintre acestia. Folositi butoanele pentru a se completa automat campurile.

## Planuri de Dezvoltare Viitoare

Pentru dezvoltări ulterioare, am în vedere:

- Implementarea unei pagini de Checkout
- Implementarea unui sistem de adrese salvate pentru utilizatori, permițând selectarea unei adrese existente sau adăugarea unei noi adrese în timpul checkout-ului
- Adăugarea suportului pentru carduri de credit/debit salvate, cu opțiunea de a selecta un card existent sau de a adăuga unul nou
- Crearea unei pagini de confirmare a comenzii care să afișeze un sumar detaliat al comenzii, informațiile de livrare și de plată, și un număr unic de comandă
- Adăugarea unui sistem de notificări prin email pentru confirmarea comenzii și actualizările privind statusul comenzii
- Implementarea unui sistem de tracking pentru comenzi, permițând utilizatorilor să urmărească statusul și locația comenzilor lor

---

Student: Stoica Cristian Ionut
