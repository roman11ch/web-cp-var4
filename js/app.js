const DEMO_BUYERS = [
  { id: 'b-1', lastName: 'Соколов', firstName: 'Дмитрий', middleName: 'Андреевич', gender: 'Мужской', nationality: 'Русский', height: 181, weight: 78, birthYear: 1998, birthMonth: 4, birthDay: 14, phone: '+7 (916) 442-18-90', postalCode: '125009', country: 'Россия', region: 'Московская', district: 'Тверской', city: 'Москва', street: 'Тверская', house: '14', apartment: '32', cardNumber: '2202 2061 4412 8801', bankAccount: '40817810200014589012' }
];
let buyers = [...DEMO_BUYERS];
function viewArray() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  buyers.forEach((item) => {
    const tr = document.createElement('tr');
    tr.className = 'buyers-table__row';
    [item.lastName, item.firstName, item.middleName, item.gender, item.nationality, item.height, item.weight, `${item.birthDay}.${item.birthMonth}.${item.birthYear}`, item.phone, item.postalCode, item.country, item.region, item.district, item.city, item.street, item.house, item.apartment, item.cardNumber, item.bankAccount].forEach((v) => {
      const td = document.createElement('td');
      td.className = 'buyers-table__cell';
      td.textContent = v || '—';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
viewArray();
