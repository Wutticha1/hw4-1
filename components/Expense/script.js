// เก็บรายการค่าใช้จ่ายจาก LocalStorage ถ้ามีข้อมูลอยู่แล้ว
const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ฟังก์ชันบันทึกข้อมูลลง LocalStorage
function saveExpensesToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// คำนวณยอดรวมทั้งหมด
function calculateTotal() {
    const sun_money = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById("sum").textContent = `${sun_money} บาท`;
}

// เพิ่มค่าใช้จ่าย
function addExpense(expenseData) {
    expenses.push(expenseData);
    saveExpensesToLocalStorage(); // บันทึกลง LocalStorage
    calculateTotal();
}

// ค้นหาค่าใช้จ่ายตามวันที่
function getExpenseByDate(date) {
    return expenses.filter(expense => expense.date === date);
}

// คำนวณยอดรวมตามประเภท
function calculateTotalByCategory(category) {
    return expenses
    .filter(expense => expense.category === category)
    .reduce((total, expense) => total + expense.amount, 0);
}

// รายงานประจำเดือน
function MonthReport(month) {
    const monthExpense = expenses.filter(expense => new Date(expense.date).getMonth() + 1 === month);
    return monthExpense;
}


function filterExpenses() {
    const categoryMapping = {
        "Food": "ค่าอาหาร 🍲",
        "Transport": "ค่าเดินทาง ✈️",
        "Entertainment": "ความบันเทิง 😜",
        "other": "อื่นๆ"
    };
    
    const selectedCategory = categoryMapping[document.getElementById("filter-category").value] || "";
    const selectedDate = document.getElementById("filter-date").value;

    document.getElementById("expense-list").innerHTML = ""; // ล้างตารางก่อนแสดงผลใหม่

    const filteredExpenses = expenses.filter(expense => {
        const matchCategory = !selectedCategory || expense.category === selectedCategory;
        const matchDate = !selectedDate || expense.date === selectedDate;

        return matchCategory && matchDate;
    });

    if (filteredExpenses.length === 0) {
        document.getElementById("expense-list").innerHTML =
            `<tr><td colspan="5" class="text-center text-gray-500 p-2">ไม่มีข้อมูลที่ตรงกับตัวกรอง</td></tr>`;
    } else {
        filteredExpenses.forEach(expense => addExpenseToTable(expense));
    }
}


document.getElementById("filter-button").addEventListener("click", filterExpenses);

document.getElementById("clear-filter").addEventListener("click", function () {
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-date").value = "";
    updateExpenseTable(expenses); // ใช้ข้อมูลที่มีอยู่โดยไม่โหลดจาก LocalStorage ใหม่
});

// ฟังก์ชันอัปเดตตารางโดยใช้ข้อมูลจาก expenses array
function updateExpenseTable(expenseList) {
    const tableBody = document.getElementById("expense-list");
    tableBody.innerHTML = ""; // ล้างข้อมูลเดิมออกก่อน

    expenseList.forEach(expense => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="border border-gray-300 p-2">${expense.title}</td>
          <td class="border border-gray-300 p-2 text-center">${expense.amount} บาท</td>
          <td class="border border-gray-300 p-2 text-center">${expense.category}</td>
          <td class="border border-gray-300 p-2 text-center">${expense.date}</td>
          <td class="border border-gray-300 p-2 text-center">
            <button class="text-red-500 hover:text-red-700" onclick="deleteExpense('${expense.id}', this)">ลบ</button>
          </td>
        `;
        tableBody.appendChild(row);
    });
}


// ฟังก์ชันที่ทำงานเมื่อกดปุ่ม submit
document.getElementById("expense-form").addEventListener("submit", function(event) {
    event.preventDefault(); // ป้องกันการส่งฟอร์มไปยังเซิร์ฟเวอร์

    // ดึงข้อมูลจากฟอร์ม
    const title = document.getElementById("title").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("select-category").value;
    const date = document.getElementById("date").value;

    if (!title || isNaN(amount) || !date) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    // สร้างข้อมูลค่าใช้จ่าย
    const expense = {
        id: "uniqueID" + Date.now(), // สร้าง unique ID โดยใช้ timestamp
        title: title,
        amount: amount,
        category: category,
        date: date,
    };

    addExpense(expense); // เพิ่มค่าใช้จ่ายใน array
    addExpenseToTable(expense); // เพิ่มค่าใช้จ่ายลงตาราง

    // Clear form fields after submission
    document.getElementById("expense-form").reset();
});

// ฟังก์ชันเพิ่มรายการลงตาราง
function addExpenseToTable(expense) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border border-gray-300 p-2">${expense.title}</td>
      <td class="border border-gray-300 p-2 text-center">${expense.amount} บาท</td>
      <td class="border border-gray-300 p-2 text-center">${expense.category}</td>
      <td class="border border-gray-300 p-2 text-center">${expense.date}</td>
      <td class="border border-gray-300 p-2 text-center">
        <button class="text-red-500 hover:text-red-700" onclick="deleteExpense('${expense.id}', this)">ลบ</button>
      </td>
    `;

    // เพิ่มแถวใหม่ไปยังตาราง
    document.getElementById("expense-list").appendChild(row);
}

// ฟังก์ชันลบรายการค่าใช้จ่าย
function deleteExpense(id, button) {

    // แสดงกล่องแจ้งเตือนให้ผู้ใช้ยืนยันก่อนลบ
    const confirmDe = confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?");
    
    if (!confirmDe) return; // ถ้าผู้ใช้กด 'ยกเลิก' ให้หยุดการทำงานของฟังก์ชัน

    // ลบข้อมูลจาก array โดยการค้นหาตาม ID
    const index = expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
        expenses.splice(index, 1); // ลบข้อมูลออกจาก array
        saveExpensesToLocalStorage(); // อัปเดตข้อมูลใน LocalStorage
        calculateTotal();
    }

    // ลบแถวที่แสดงในตาราง
    const row = button.closest("tr"); // ค้นหาแถวที่คลิกปุ่มลบ
    row.remove(); // ลบแถวจากตาราง
}

// ฟังก์ชันโหลดข้อมูลจาก LocalStorage และแสดงผลในตาราง
function loadExpensesFromLocalStorage() {
    // document.getElementById("expense-list").innerHTML = "";
    expenses.forEach(expense => addExpenseToTable(expense));
    calculateTotal();
}

// เรียกใช้เมื่อล็ดหน้าเว็บ
loadExpensesFromLocalStorage();
