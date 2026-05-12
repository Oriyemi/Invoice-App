document.addEventListener("DOMContentLoaded", () => {

    // ================= THEME =================
    const getThemeSwitch = document.querySelector("#theme-switcher");
    const body = document.body;

    if (getThemeSwitch) {
        getThemeSwitch.addEventListener("click", () => {
            body.classList.toggle("dark-theme");
        });
    }

    // ================= MODAL =================
    const modal = document.querySelector("#create-invoiceModal");
    const openBtn = document.querySelector("#openForm");
    const closeBtn = document.getElementById("closeForm");
    const addItemBtn = document.getElementById("addItem");
    const itemList = document.getElementById("itemList");
    const invoiceForm = document.getElementById("invoiceForm");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }

    // ================= ITEMS =================
    function createItemRow() {
        const div = document.createElement("div");
        div.className = "grid grid-cols-12 gap-4 items-center mb-4 item-row";

        div.innerHTML = `
            <div class="col-span-5">
                <input type="text" placeholder="Item Name" class="w-full border p-2 rounded item-name" required>
            </div>
            <div class="col-span-2">
                <input type="number" value="1" min="1" class="w-full border p-2 rounded item-qty">
            </div>
            <div class="col-span-2">
                <input type="number" value="0" class="w-full border p-2 rounded item-price">
            </div>
            <div class="col-span-2 text-gray-400 font-bold item-total">0.00</div>
            <div class="col-span-1 text-center">
                <button type="button" class="delete-item text-gray-400 hover:text-red-500">🗑️</button>
            </div>
        `;

        itemList.appendChild(div);

        const qtyInput = div.querySelector(".item-qty");
        const priceInput = div.querySelector(".item-price");
        const totalDisplay = div.querySelector(".item-total");

        const updateTotal = () => {
            const total = (qtyInput.value * priceInput.value).toFixed(2);
            totalDisplay.innerText = total;
        };

        qtyInput.addEventListener("input", updateTotal);
        priceInput.addEventListener("input", updateTotal);

        div.querySelector(".delete-item").onclick = () => div.remove();
    }

    if (addItemBtn) {
        addItemBtn.onclick = createItemRow;
    }

    createItemRow();

    // ================= FORM =================
    if (invoiceForm) {
        invoiceForm.onsubmit = (e) => {
            e.preventDefault();

            const formData = new FormData(invoiceForm);

            const invoice = {
                from: formData.get("fromStreet"),
                items: []
            };

            document.querySelectorAll(".item-row").forEach(row => {
                invoice.items.push({
                    name: row.querySelector(".item-name").value,
                    qty: row.querySelector(".item-qty").value,
                    price: row.querySelector(".item-price").value,
                    total: row.querySelector(".item-total").innerText
                });
            });

            console.log("Saving Invoice Data:", invoice);
            alert("Invoice Saved Successfully!");

            modal.classList.add("hidden");
        };
    }

    // ================= DATE =================
    const dateInput = document.getElementById("invoiceDate");
    const termsSelect = document.getElementById("paymentTerms");

    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
    }

    if (dateInput) {
        dateInput.addEventListener("change", (e) => {
            console.log("New Invoice Date:", e.target.value);
        });
    }

    if (termsSelect) {
        termsSelect.addEventListener("change", (e) => {
            console.log("Selected Term:", e.target.value);
        });
    }
});