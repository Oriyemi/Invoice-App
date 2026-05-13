document.addEventListener("DOMContentLoaded", () => {
    const getThemeSwitch = document.querySelector("#theme-switcher");
    const body = document.body;

    if (getThemeSwitch) {
        getThemeSwitch.addEventListener("click", () => {
            body.classList.toggle("dark-theme");
        });
    }

   
    const modal = document.querySelector("#create-invoiceModal");
    const openBtn = document.querySelector("#openForm");
    const closeBtn = document.querySelector("#closeForm");
    const addItemBtn = document.querySelector("#addItem");
    const itemList = document.querySelector("#itemList");
    const invoiceForm = document.querySelector("#invoiceForm");

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

   
    function createItemRow() {
        const item = document.createElement("div");

        item.className = "grid grid-cols-12 gap-4 items-center mb-4 item-row";

        item.innerHTML = `
        <div class="col-span-5">
            <input type="text" placeholder="Item Name" class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-name" required >
        </div>

        <div class="col-span-2">
            <input type="number" value="1" min="1" class="w-full border border-[#7E88C3] p-2 rounded  dynamic-bg dynamic-sub-text item-qty">
        </div>

        <div class="col-span-2">
            <input type="number" value="0" class="w-full border border-[#7E88C3] p-2 rounded 
            dynamic-bg dynamic-sub-text item-price" >
        </div>

        <div class="col-span-2 font-bold dynamic-text item-total">
            0.00
        </div>

        <div class="col-span-1 text-center">
            <button type="button" class="delete-item text-gray-400 hover:text-red-500">
                🗑️
            </button>
        </div>
    `;

        itemList.appendChild(item);

        const qtyInput = item.querySelector(".item-qty");
        const priceInput = item.querySelector(".item-price");
        const totalDisplay = item.querySelector(".item-total");

        const updateTotal = () => {
            const total = (qtyInput.value * priceInput.value).toFixed(2);
            totalDisplay.innerText = total;
        };

        qtyInput.addEventListener("input", updateTotal);
        priceInput.addEventListener("input", updateTotal);

        item.querySelector(".delete-item").onclick = () => item.remove();
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

                billFrom: {
                    street: formData.get("fromStreet"),
                    city: formData.get("city"),
                    postCode: formData.get("postCode"),
                    country: formData.get("country")
                },

                billTo: {
                    clientName: formData.get("clientName"),
                    clientEmail: formData.get("clientEmail"),
                    streetAddress: formData.get("StreetAddress"),
                    city: formData.get("city1"),
                    postCode: formData.get("postCode2"),
                    country: formData.get("country")
                },

                invoiceDate: document.getElementById("invoiceDate").value,

                paymentTerms:
                    document.getElementById("paymentTerms").value,

                projectDescription:
                    formData.get("projectDescription"),

                items: []
            };



            document.querySelectorAll(".item-row").forEach((row) => {

                invoice.items.push({

                    name:
                        row.querySelector(".item-name").value,

                    qty:
                        row.querySelector(".item-qty").value,

                    price:
                        row.querySelector(".item-price").value,

                    total:
                        row.querySelector(".item-total").innerText
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