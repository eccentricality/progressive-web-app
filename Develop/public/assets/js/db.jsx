let db;
// create a new db
const req = window.indexedDB.open("BudgetDB", 1);

req.onupgradeneeded = function (event) {
  db = event.target.result;
  // create object store, set autoIncrement to true
  db.createObjectStore("BudgetStore", {
    keyPath: "id",
    autoIncrement: true
  });  
};

req.onsuccess = function () {
  db = req.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

req.onerror = function (event) {
  // error logs
  console.log("Error: ", req.error)
};

function saveRecord(record) {
  console.log(record)
  // create transaction and mutate
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const BudgetStore = transaction.objectStore("BudgetStore");
  BudgetStore.add(record)
}

function checkDatabase() {
  // open transaction
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const BudgetStore = transaction.objectStore("BudgetStore");
  const getAll = BudgetStore.getAll();
  
  getAll.onsuccess = function () {
    console.log(getAll.result);
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // open a transaction on pending db
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const BudgetStore = transaction.objectStore("BudgetStore");
          BudgetStore.clear();
        });
    }
  };
}

window.addEventListener('online', checkDatabase);