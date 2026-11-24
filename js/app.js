const STORAGE_KEY = 'buyers_db_v4_records';

const DEMO_BUYERS = [
  {
    id: 'b-1',
    lastName: 'Соколов',
    firstName: 'Дмитрий',
    middleName: 'Андреевич',
    gender: 'Мужской',
    nationality: 'Русский',
    height: 181,
    weight: 78,
    birthYear: 1998,
    birthMonth: 4,
    birthDay: 14,
    phone: '+7 (916) 442-18-90',
    postalCode: '125009',
    country: 'Россия',
    region: 'Московская',
    district: 'Тверской',
    city: 'Москва',
    street: 'Тверская',
    house: '14',
    apartment: '32',
    cardNumber: '2202 2061 4412 8801',
    bankAccount: '40817810200014589012'
  },
  {
    id: 'b-2',
    lastName: 'Крылова',
    firstName: 'Анна',
    middleName: 'Викторовна',
    gender: 'Женский',
    nationality: 'Русская',
    height: 168,
    weight: 56,
    birthYear: 2001,
    birthMonth: 9,
    birthDay: 3,
    phone: '+7 (921) 805-33-12',
    postalCode: '191014',
    country: 'Россия',
    region: 'Ленинградская',
    district: 'Центральный',
    city: 'Санкт-Петербург',
    street: 'Литейный пр-т',
    house: '41',
    apartment: '19',
    cardNumber: '2200 7004 9123 1140',
    bankAccount: '40817810555000981234'
  },
  {
    id: 'b-3',
    lastName: 'Мельников',
    firstName: 'Егор',
    middleName: 'Павлович',
    gender: 'Мужской',
    nationality: 'Русский',
    height: 175,
    weight: 71,
    birthYear: 1995,
    birthMonth: 12,
    birthDay: 22,
    phone: '+7 (903) 719-04-55',
    postalCode: '420111',
    country: 'Россия',
    region: 'Татарстан',
    district: 'Вахитовский',
    city: 'Казань',
    street: 'Баумана',
    house: '28',
    apartment: '7',
    cardNumber: '4276 8380 5510 3029',
    bankAccount: '40817810962000441180'
  },
  {
    id: 'b-4',
    lastName: 'Орлова',
    firstName: 'Мария',
    middleName: 'Игоревна',
    gender: 'Женский',
    nationality: 'Белоруска',
    height: 171,
    weight: 59,
    birthYear: 1999,
    birthMonth: 6,
    birthDay: 8,
    phone: '+7 (985) 310-67-21',
    postalCode: '620014',
    country: 'Россия',
    region: 'Свердловская',
    district: 'Ленинский',
    city: 'Екатеринбург',
    street: 'Малышева',
    house: '53',
    apartment: '104',
    cardNumber: '5469 3800 7721 6405',
    bankAccount: '40817810816540023901'
  }
];

let buyers = [];
const selectedIds = new Set();
const currentSort = { field: 'lastName', dir: 'asc' };
let batchRemaining = 0;
let batchTotal = 0;
let justResized = false;

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buyers));
  } catch (e) {
    // Storage restricted fallback
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        buyers = parsed;
        return;
      }
    }
  } catch (e) {
    // Fallback to demo data
  }
  buyers = DEMO_BUYERS.map((item) => ({ ...item }));
  saveToStorage();
}

function showToast(message) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = message;
  toastEl.classList.add('toast--visible');
  setTimeout(() => toastEl.classList.remove('toast--visible'), 2400);
}

function formatBirthDate(buyer) {
  if (!buyer.birthYear && !buyer.birthMonth && !buyer.birthDay) return '—';
  const y = String(buyer.birthYear || '0000').padStart(4, '0');
  const m = String(buyer.birthMonth || '01').padStart(2, '0');
  const d = String(buyer.birthDay || '01').padStart(2, '0');
  return `${d}.${m}.${y}`;
}

// 4. Функция поиска и вывода на экран объектов с заданным значением свойства
function searchByProperty(list, query) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((item) =>
    Object.entries(item).some(([key, val]) => {
      if (key === 'id') return false;
      return String(val).toLowerCase().includes(q);
    })
  );
}

// 5. Функция упорядочения массива структур по заданному свойству
function sortByProperty(list, field, dir) {
  const factor = dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    if (field === 'birthDate') {
      const da = (a.birthYear || 0) * 10000 + (a.birthMonth || 0) * 100 + (a.birthDay || 0);
      const db = (b.birthYear || 0) * 10000 + (b.birthMonth || 0) * 100 + (b.birthDay || 0);
      return (da - db) * factor;
    }
    const va = a[field];
    const vb = b[field];
    if (typeof va === 'number' && typeof vb === 'number') {
      return (va - vb) * factor;
    }
    return String(va || '').localeCompare(String(vb || ''), 'ru') * factor;
  });
}

function updateSortHeaders() {
  document.querySelectorAll('.buyers-table__header-cell--sortable').forEach((th) => {
    const icon = th.querySelector('.buyers-table__sort-icon');
    if (th.dataset.sort === currentSort.field) {
      th.classList.add('buyers-table__header-cell--active');
      if (icon) icon.textContent = currentSort.dir === 'asc' ? '↑' : '↓';
    } else {
      th.classList.remove('buyers-table__header-cell--active');
      if (icon) icon.textContent = '';
    }
  });
}

function updateSelectionUI(visibleList) {
  const count = selectedIds.size;
  document.getElementById('selectedCount').textContent = count;
  document.getElementById('btnDeleteSelected').disabled = count === 0;

  const selectAll = document.getElementById('selectAll');
  if (visibleList.length > 0 && visibleList.every((item) => selectedIds.has(item.id))) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else if (visibleList.some((item) => selectedIds.has(item.id))) {
    selectAll.checked = false;
    selectAll.indeterminate = true;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }

  document.querySelectorAll('#tableBody .buyers-table__row').forEach((tr) => {
    const cb = tr.querySelector('.buyers-table__checkbox');
    if (cb) {
      tr.classList.toggle('buyers-table__row--selected', selectedIds.has(cb.dataset.id));
    }
  });
}

// 2. Функция просмотра содержимого массива объектов
function viewArray() {
  const query = document.getElementById('searchQuery').value;
  const filtered = searchByProperty(buyers, query);
  const sorted = sortByProperty(filtered, currentSort.field, currentSort.dir);

  const countLabel = document.getElementById('recordCountLabel');
  countLabel.textContent = sorted.length === buyers.length
    ? `(${buyers.length})`
    : `(${sorted.length} из ${buyers.length})`;

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'buyers-table__row';
    const td = document.createElement('td');
    td.colSpan = 20;
    td.className = 'buyers-table__empty';
    td.textContent = buyers.length === 0
      ? 'Массив записей пуст. Нажмите «Добавить».'
      : 'По заданному критерию записи не найдены.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    sorted.forEach((item) => {
      const tr = document.createElement('tr');
      tr.className = 'buyers-table__row';
      const isSelected = selectedIds.has(item.id);
      if (isSelected) tr.classList.add('buyers-table__row--selected');

      const tdCheck = document.createElement('td');
      tdCheck.className = 'buyers-table__cell buyers-table__cell--checkbox';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'buyers-table__checkbox';
      cb.checked = isSelected;
      cb.dataset.id = item.id;
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedIds.add(item.id);
        } else {
          selectedIds.delete(item.id);
        }
        updateSelectionUI(sorted);
      });
      tdCheck.appendChild(cb);
      tr.appendChild(tdCheck);

      const cells = [
        item.lastName,
        item.firstName,
        item.middleName || '—',
        item.gender || '—',
        item.nationality || '—',
        item.height || '—',
        item.weight || '—',
        formatBirthDate(item),
        item.phone || '—',
        item.postalCode || '—',
        item.country || '—',
        item.region || '—',
        item.district || '—',
        item.city || '—',
        item.street || '—',
        item.house || '—',
        item.apartment || '—',
        item.cardNumber || '—',
        item.bankAccount || '—'
      ];

      const monoIndices = new Set([5, 6, 7, 8, 9, 15, 16, 17, 18]);
      cells.forEach((val, idx) => {
        const td = document.createElement('td');
        td.className = monoIndices.has(idx)
          ? 'buyers-table__cell buyers-table__cell--mono'
          : 'buyers-table__cell';
        td.textContent = val;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  updateSelectionUI(sorted);
}

// 3. Функция дополнения массива новым объектом
function appendRecord(record) {
  buyers.push(record);
  saveToStorage();
  viewArray();
}

// 6. Функция удаления одного или нескольких объектов из массива
function deleteSelectedRecords() {
  if (selectedIds.size === 0) return;
  const removedCount = selectedIds.size;
  buyers = buyers.filter((item) => !selectedIds.has(item.id));
  selectedIds.clear();
  saveToStorage();
  viewArray();
  showToast(`Удалено записей: ${removedCount}`);
}

function clearForm() {
  document.getElementById('buyerForm').reset();
  document.getElementById('fGender').value = 'Мужской';
}

function openAddModal(isBatch = false) {
  clearForm();
  const note = document.getElementById('batchNote');
  if (isBatch && batchRemaining > 0) {
    const currentStep = batchTotal - batchRemaining + 1;
    note.textContent = `Ввод массива: запись ${currentStep} из ${batchTotal}`;
  } else {
    batchRemaining = 0;
    batchTotal = 0;
    note.textContent = '';
  }
  document.getElementById('modalBackdrop').classList.add('modal--open');
  document.getElementById('fLastName').focus();
}

function closeAddModal() {
  batchRemaining = 0;
  batchTotal = 0;
  document.getElementById('modalBackdrop').classList.remove('modal--open');
}

function collectFormRecord() {
  const lastName = document.getElementById('fLastName').value.trim();
  const firstName = document.getElementById('fFirstName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();

  if (!lastName || !firstName || !phone) {
    showToast('Заполните обязательные поля: Фамилия, Имя, Телефон');
    return null;
  }

  const dateVal = document.getElementById('fBirthDate').value;
  let birthYear = '';
  let birthMonth = '';
  let birthDay = '';
  if (dateVal) {
    const parts = dateVal.split('-');
    birthYear = Number(parts[0]);
    birthMonth = Number(parts[1]);
    birthDay = Number(parts[2]);
  }

  return {
    id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    lastName,
    firstName,
    middleName: document.getElementById('fMiddleName').value.trim(),
    gender: document.getElementById('fGender').value,
    nationality: document.getElementById('fNationality').value.trim(),
    height: Number(document.getElementById('fHeight').value) || 0,
    weight: Number(document.getElementById('fWeight').value) || 0,
    birthYear,
    birthMonth,
    birthDay,
    phone,
    postalCode: document.getElementById('fPostalCode').value.trim(),
    country: document.getElementById('fCountry').value.trim(),
    region: document.getElementById('fRegion').value.trim(),
    district: document.getElementById('fDistrict').value.trim(),
    city: document.getElementById('fCity').value.trim(),
    street: document.getElementById('fStreet').value.trim(),
    house: document.getElementById('fHouse').value.trim(),
    apartment: document.getElementById('fApartment').value.trim(),
    cardNumber: document.getElementById('fCardNumber').value.trim(),
    bankAccount: document.getElementById('fBankAccount').value.trim()
  };
}

function handleSave(keepOpen) {
  const record = collectFormRecord();
  if (!record) return;
  appendRecord(record);
  showToast('Запись добавлена');

  if (batchRemaining > 1) {
    batchRemaining -= 1;
    openAddModal(true);
  } else if (keepOpen) {
    batchRemaining = 0;
    batchTotal = 0;
    openAddModal(false);
  } else {
    closeAddModal();
  }
}


function formArray(count, mode) {
  if (mode === 'replace') { buyers = []; selectedIds.clear(); saveToStorage(); viewArray(); }
  batchTotal = count; batchRemaining = count;
  document.getElementById('batchModalBackdrop').classList.remove('modal--open');
  openAddModal(true);
}
document.getElementById('btnAdd').addEventListener('click', () => openAddModal(false));
document.getElementById('btnCloseModal').addEventListener('click', closeAddModal);
document.getElementById('btnCancelModal').addEventListener('click', closeAddModal);
document.getElementById('btnSaveRecord').addEventListener('click', () => handleSave(false));
document.getElementById('btnSaveAndNext').addEventListener('click', () => handleSave(true));
document.getElementById('btnBatch').addEventListener('click', () => document.getElementById('batchModalBackdrop').classList.add('modal--open'));
document.getElementById('btnStartBatch').addEventListener('click', () => {
  const count = Math.max(1, Math.min(20, Number(document.getElementById('batchCountInput').value) || 1));
  formArray(count, document.getElementById('batchModeSelect').value);
});
loadFromStorage();
viewArray();
