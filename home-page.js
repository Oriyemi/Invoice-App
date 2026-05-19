document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.querySelector("#theme-switcher");
    const body = document.body;

  
    if (themeSwitch) {
        themeSwitch.addEventListener("click", () => {
            body.classList.toggle("dark-theme");
        });
    }

 
    const modal = document.querySelector("#create-invoiceModal");
    const openBtn = document.querySelector("#openForm");
    const closeBtn = document.querySelector("#closeForm");
    const addItemBtn = document.querySelector("#addItem");
    const itemList = document.querySelector("#itemList");
    const invoiceForm = document.querySelector("#invoiceForm");
    const emailInput = document.querySelector("#clientEmail");
    const emailError = document.querySelector("#emailError");
    const totalInvoicesText = document.querySelector("#total-invoices");
    const invoiceDisplay = document.querySelector("#invoice-display");

    let allInvoices = [];
    let status;

 
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

        item.innerHTML = ` <div class="col-span-5">
                <input   type="text" placeholder="Item Name" class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-name" required >
            </div>

            <div class="col-span-2">
                <input  type="text" class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-qty" required >
            </div>

            <div class="col-span-2">
                <input type="text"class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-price" required >
            </div>

            <div class="col-span-2 font-bold dynamic-text item-total"> 0.00 </div>

            <div class="col-span-1 text-center">
                <button type="button" class="delete-item text-gray-400 hover:text-red-500">
                 🗑️
                </button>
            </div> `;

        itemList.appendChild(item);

        const qtyInput = item.querySelector(".item-qty");
        const priceInput = item.querySelector(".item-price");
        const totalDisplay = item.querySelector(".item-total");

        function updateTotal() {
            const qty = Number(qtyInput.value) || 0;
            const price = Number(priceInput.value) || 0;

            totalDisplay.innerText = (qty * price).toFixed(2);
        }

        qtyInput.addEventListener("input", updateTotal);
        priceInput.addEventListener("input", updateTotal);

        updateTotal();

        item.querySelector(".delete-item").addEventListener("click", () => {
            item.remove();
        });
    }

    if (addItemBtn) {
        addItemBtn.addEventListener("click", createItemRow);
    }

  
    if (emailInput) {
        emailInput.addEventListener("onchange", () => {
            const isValid = emailInput.value.includes("@") && emailInput.value.includes(".");
        
            if (isValid ) {
                emailError.textContent = "";
                emailInput.classList.remove("border-red-500");
            } else {
                emailError.textContent = "Please enter a valid email";
                emailInput.classList.add("border-red-500");
            }
        });
    }
    
    
    if (invoiceForm) {
        invoiceForm.addEventListener("submit", (e) => {
            e.preventDefault();
 
          
            // if (!emailInput.value.includes("@")) {
            //     emailError.textContent = "Please enter a valid email";
            //     emailInput.classList.add("border-red-500");
            //     return;
            // }

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
                    country: formData.get("country1")
                },

                invoiceDate: document.getElementById("invoiceDate").value,

                paymentTerms:
                    document.getElementById("paymentTerms").value,
                paymentStatus: document.querySelector("#paymentStatus").value,
                

                projectDescription:
                    formData.get("projectDescription"),

                items: []
            };
            
           
            document.querySelectorAll(".item-row").forEach((row) => {
                invoice.items.push({
                    name: row.querySelector(".item-name").value,
                    qty: row.querySelector(".item-qty").value,
                    price: row.querySelector(".item-price").value,
                    total: row.querySelector(".item-total").innerText
                });
            });

          
            allInvoices.push(invoice);
            status = invoice;
        
            renderInvoices();
 
            invoiceForm.reset();

            itemList.innerHTML = "";
            createItemRow();

            modal.classList.add("hidden");

           
        });
    }
    function renderInvoices() {
        invoiceDisplay.innerHTML = "";
        
        if (allInvoices.length === 0) {
            totalInvoicesText.textContent = "No invoices available";
        } else if (allInvoices.length === 1) {
            totalInvoicesText.textContent = "1 invoice available";
        } else {
            totalInvoicesText.textContent = `There are ${allInvoices.length} total invoices `;
        }
        if (allInvoices.length === 0) {
            invoiceDisplay.innerHTML = `
                <p class="text-center dynamic-sub-text">
                    No invoices available
                </p>
            `;
            return;
        }

        allInvoices.forEach((inv, index) => {
            const totalAmount = inv.items
                .reduce((sum, item) => sum + Number(item.total), 0)
                .toFixed(2);

            const card = document.createElement("div");

             card.className = "dynamic-text dynamic-sub-text dynamic-bg  p-6 rounded-lg shadow-sm flex items-center sm:w-[672px] lg:w-[730px] h-[72px] justify-between border border-transparent hover:border-[#7C5DFA] mb-4 font-['League_Spartan'] font-medium text-[13px] leading-[15px] tracking-[-0.1px]";

              card.innerHTML = ` <div class="flex items-center px-6 gap-6">
              <span class="font-bold dynamic-text">
                #INV-${index + 1}
              </span>

               <span class="dynamic-sub-text text-[13px]">
                 Due ${inv.invoiceDate}
                </span>

              <span class="dynamic-sub-text text-[13px]">
                 ${inv.billTo.clientName}
               </span>  </div>

             <div class="flex items-center gap-8">

                <span class="dynamic-text font-bold text-[16px]">
                  £ ${totalAmount}
               </span>
                 ${inv.paymentStatus === "paid" ? `
                    <div class="bg-[#33d69f14] text-[#33D69F] px-6 py-3 rounded-md flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-[#33D69F]"></span>
                        <span class="font-bold text-[12px]">  Paid </span>
                    </div> ` : inv.paymentStatus === "draft" ? `
                     <div class="bg-[#f8172a14] text-[#f8172a] px-6 py-3 rounded-md flex items-center gap-2"> <span class="w-2 h-2 rounded-full bg-[#f8172a]"></span> <span class="font-bold text-[12px]"> Draft </span>
                    </div> `  : inv.paymentStatus === "pending"   ? `<div class="bg-[#7733d614] text-[#7733d6] px-6 py-3 rounded-md flex items-center gap-2">
                     <span class="w-2 h-2 rounded-full bg-[#7733d6]"></span><span class="font-bold text-[12px]">   Pending  </span>
                    </div> `: ""
                 }
                
                 <div class="view-btn cursor-pointer" data-index="${index}">
                  <img src="./src/images/Path 5.png" alt="drop-down">
                 </div>
               </div> `;
                
                invoiceDisplay.appendChild(card);
            });

    }


    
    const dateInput = document.getElementById("invoiceDate");
    const termsSelect = document.getElementById("paymentTerms");
    const statusSelected=document.querySelector("#paymentStatus")

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

    if (statusSelected) {
        statusSelected.addEventListener("change", (e) => {
            console.log("Selected Status:", e.target.value);
        });
    }

//     document.querySelectorAll(".view-btn").forEach((btn) => {
//         btn.add("click", () => {
           
//        })
//    })
});