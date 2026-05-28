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
  const homeInvoice = document.querySelector("#home-invoice");
  const dropDownBtn = document.querySelector("#drop-down");
  const filterMenu = document.querySelector("#filter-menu");
  const filterCheckboxes = document.querySelectorAll(".filter-checkbox");

  const discardBtn = document.querySelector("#closeForm");
  const draftBtn = document.querySelector("#save-draft-btn");
  const InvoiceId = document.querySelector("#invoice-Id");
  const submitBtn = invoiceForm ? invoiceForm.querySelector('button[type="submit"]') : null;

  // FIX 1: Load saved invoices from localStorage on page load, fallback to empty array if none exist
  let allInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
  let editingIndex = null;
  let activeFilters = [];

  // Initial render when the app loads so saved cards show up immediately
  renderInvoices();

  // Helper function to calculate the dynamic payment due date
  function calculateDueDate(dateString, termsValue) {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback if invalid date

    // Extract numbers from termsValue string (e.g., "net 14 days" or "14" becomes 14)
    const daysToAdd = parseInt(String(termsValue).replace(/\D/g, ""), 10) || 0;

    // Add days to the base invoice date
    date.setDate(date.getDate() + daysToAdd);

    // Format output date nicely as DD MMM YYYY (e.g., 05 Jun 2026)
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }

  // Helper function to parse inputs back to YYYY-MM-DD format for form editing 
  function formatToInputDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function openInvoiceModal() {
    if (!modal) return;
    modal.classList.remove("hidden");

    const firstInput = invoiceForm ? invoiceForm.querySelector("input") : null;
    if (firstInput) firstInput.focus();

    if (editingIndex !== null) {
      if (InvoiceId) InvoiceId.textContent = `Edit #INV-${editingIndex + 1}`;
      if (discardBtn) discardBtn.textContent = "Cancel";
      if (submitBtn) submitBtn.textContent = "Save Changes";
      if (draftBtn) draftBtn.classList.add("hidden");
    } else {
      if (InvoiceId) InvoiceId.textContent = "New Invoice";
      if (discardBtn) discardBtn.textContent = "Discard";
      if (submitBtn) submitBtn.textContent = "Save & Send";
      if (draftBtn) draftBtn.classList.remove("hidden");
    }

    if (itemList && editingIndex === null) {
      itemList.innerHTML = "";
      createItemRow();
    }
  }

  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      editingIndex = null;
      if (invoiceForm) invoiceForm.reset();
      if (itemList) itemList.innerHTML = "";
      openInvoiceModal();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("hidden");
      editingIndex = null;
    });
  }

  if (dropDownBtn && filterMenu) {
    dropDownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!filterMenu.contains(e.target) && !dropDownBtn.contains(e.target)) {
        filterMenu.classList.add("hidden");
      }
    });
  }

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      activeFilters = Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      renderInvoices();
    });
  });

  function createItemRow() {
    if (!itemList) return;

    const item = document.createElement("div");
    item.className = "grid grid-cols-12 gap-4 items-center mb-4 item-row";

    item.innerHTML = `
      <div class="col-span-5">
          <input type="text" placeholder="Item Name" class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-name" required >
      </div>
      <div class="col-span-2">
          <input type="number" class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-qty" required >
      </div>
      <div class="col-span-2">
          <input type="number" class="w-full border border-[#7E88C3] p-2 rounded dynamic-bg dynamic-sub-text item-price" required >
      </div>
      <div class="col-span-2 font-bold dynamic-text item-total"> 0.00 </div>
      <div class="col-span-1 text-center">
          <img src="./src/images/delete.svg" alt="delete" class="delete-item text-gray-400 hover:text-red-500 cursor-pointer">
      </div>
    `;

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
    addItemBtn.addEventListener("click", (e) => {
      e.preventDefault();
      createItemRow();
    });
  }

  if (emailInput) {
    emailInput.addEventListener("change", () => {
      const isValid = emailInput.value.includes("@") && emailInput.value.includes(".");
      if (isValid) {
        emailError.textContent = "";
        emailInput.classList.remove("border-red-500");
      } else {
        emailError.textContent = "Please enter a valid email";
        emailInput.classList.add("border-red-500");
      }
    });
  }

  if (draftBtn) {
    draftBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitInvoiceForm("draft");
    });
  }

  if (invoiceForm) {
    invoiceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const defaultStatus = editingIndex !== null ? allInvoices[editingIndex].paymentStatus : "pending";
      submitInvoiceForm(defaultStatus === "draft" ? "pending" : defaultStatus);
    });
  }

  function submitInvoiceForm(forcedStatus = null) {
    const formData = new FormData(invoiceForm);

    const rawInvoiceDate = formData.get("invoiceDate") || (document.getElementById("invoiceDate") ? document.getElementById("invoiceDate").value : "");
    const rawPaymentTerms = formData.get("paymentTerms") || (document.getElementById("paymentTerms") ? document.getElementById("paymentTerms").value : "");

    // Dynamically calculate our dynamic payment due date string here
    const computedDueDate = calculateDueDate(rawInvoiceDate, rawPaymentTerms);

    // Human-readable reformatting for invoice date output presentation standard
    let formattedInvoiceDate = rawInvoiceDate;
    if (rawInvoiceDate) {
      const d = new Date(rawInvoiceDate);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        formattedInvoiceDate = `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }
    }

    const invoice = {
      billFrom: {
        street: formData.get("fromStreet"),
        city: formData.get("city"),
        postCode: formData.get("postCode"),
        country: formData.get("country"),
      },
      billTo: {
        clientName: formData.get("clientName"),
        clientEmail: formData.get("clientEmail"),
        streetAddress: formData.get("StreetAddress"),
        city: formData.get("city1"),
        postCode: formData.get("postCode2"),
        country: formData.get("country1"),
      },
      invoiceDate: formattedInvoiceDate,
      rawInvoiceDate: rawInvoiceDate, // Cached fallback to easily reload into date pickers later
      paymentTerms: rawPaymentTerms,
      paymentDueDate: computedDueDate, // Saved calculation field
      paymentStatus: forcedStatus || formData.get("paymentStatus") || (document.querySelector("#paymentStatus") ? document.querySelector("#paymentStatus").value : "pending"),
      projectDescription: formData.get("projectDescription"),
      items: [],
    };

    let itemRows = document.querySelectorAll(".item-row");
    if (itemRows.length === 0 && forcedStatus !== "draft") {
      alert("Please add at least one item row before submitting.");
      return;
    }

    itemRows.forEach((row) => {
      const name = row.querySelector(".item-name");
      const qty = row.querySelector(".item-qty");
      const price = row.querySelector(".item-price");
      const total = row.querySelector(".item-total");

      if (name && qty && price) {
        invoice.items.push({
          name: name.value,
          qty: qty.value,
          price: price.value,
          total: total.innerText,
        });
      }
    });

    if (editingIndex !== null) {
      allInvoices[editingIndex] = invoice;
    } else {
      allInvoices.push(invoice);
    }

    // FIX 2: Save state changes after creating or editing an invoice
    localStorage.setItem("invoices", JSON.stringify(allInvoices));

    if (modal) modal.classList.add("hidden");
    if (homeInvoice) homeInvoice.classList.remove("hidden");
    renderInvoices();

    setTimeout(() => {
      invoiceForm.reset();
      if (itemList) itemList.innerHTML = "";
      editingIndex = null;
    }, 50);
  }

  function renderInvoices() {
    if (!invoiceDisplay) return;
    invoiceDisplay.innerHTML = "";

    let invoicesToRender = allInvoices;

    if (activeFilters.length > 0) {
      invoicesToRender = invoicesToRender.filter((inv) =>
        activeFilters.includes(inv.paymentStatus)
      );
    }

    if (allInvoices.length === 0) {
      totalInvoicesText.textContent = "No invoices available";
    } else if (allInvoices.length === 1) {
      totalInvoicesText.textContent = "1 invoice available";
    } else {
      totalInvoicesText.textContent = `There are ${allInvoices.length} total invoices`;
    }

    if (allInvoices.length === 0) {
      invoiceDisplay.innerHTML = `
        <div class="flex flex-col items-center justify-center lg:mt-4 mt-12">
          <img src="./src/images/Email campaign_Flatline.svg" alt="email" class="lg:mt-8" />
          <h1 class="font-['League_Spartan'] font-bold text-[24px] leading-[100%] tracking-[-0.75px] mt-16 lg:mt-4 dynamic-text">There is nothing here</h1>
          <p class="font-['League_Spartan'] font-medium text-[13px] leading-3.75 tracking-[-0.1px] text-center text-[#888EB0] mt-5">Create an invoice by clicking the</p>
          <p class="font-['League_Spartan'] font-bold text-[13px] leading-3.75 tracking-[-0.1px] text-center text-[#888EB0]">New Invoice button and get started</p>
        </div>
      `;
      return;
    }

    invoicesToRender.forEach((inv, index) => {
      const totalAmount = inv.items
        .reduce((sum, item) => sum + Number(item.total), 0)
        .toFixed(2);

      const card = document.createElement("div");
      card.className = "dynamic-card dynamic-text dynamic-sub-text p-6 rounded-lg shadow-sm flex flex-col mx-auto w-[calc(100%-3rem)] md:w-full md:flex-row md:items-center max-w-[730px] justify-between border border-transparent hover:border-[#7C5DFA] mb-4 font-['League_Spartan'] cursor-pointer transition-all";

      card.innerHTML = `
        <div class="grid grid-cols-2  w-full gap-y-6 md:hidden">
            <div class="text-left font-bold dynamic-text text-[14px]">
                #INV-${index + 1}
            </div>
            <div class="text-right dynamic-sub-text text-[13px] font-medium text-[#858BB2]">
                ${inv.billTo.clientName}
            </div>

            <div class="flex flex-col gap-2 justify-end">
                <span class="dynamic-sub-text text-[13px]">Due ${inv.paymentDueDate || inv.invoiceDate}</span>
                <span class="dynamic-text font-bold text-[16px] tracking-[-0.8px]">£ ${totalAmount}</span>
            </div>
            <div class="flex items-center justify-end">
                ${inv.paymentStatus === "paid"
          ? `<div class="bg-[#33d69f14] text-[#33D69F] w-26 h-10 rounded-md flex items-center justify-center gap-2"><span class="w-2 h-2 rounded-full bg-[#33D69F]"></span><span class="font-bold text-[12px]">Paid</span></div>`
          : inv.paymentStatus === "draft"
            ? `<div class="bg-[#97979714] text-[#373B53] dark:text-[#DFE3FA] w-26 h-10 rounded-md flex items-center justify-center gap-2"><span class="w-2 h-2 rounded-full bg-[#373B53] dark:bg-[#DFE3FA]"></span><span class="font-bold text-[12px]">Draft</span></div>`
            : `<div class="bg-[#FF8F0014] text-[#FF8F00] w-26 h-10 rounded-md flex items-center justify-center gap-2"><span class="w-2 h-2 rounded-full bg-[#FF8F00]"></span><span class="font-bold text-[12px]">Pending</span></div>`
        }
            </div>
        </div>

        <div class="hidden md:flex items-center w-full justify-between">
            <div class="flex items-center px-6 gap-6">
              <span class="font-bold dynamic-text">#INV-${index + 1}</span>
              <span class="dynamic-sub-text text-[13px]">Due ${inv.paymentDueDate || inv.invoiceDate}</span>
              <span class="dynamic-sub-text text-[13px]">${inv.billTo.clientName}</span>
            </div>
            <div class="flex items-center gap-8">
              <span class="dynamic-text font-bold text-[16px]">£ ${totalAmount}</span>
              ${inv.paymentStatus === "paid"
          ? `<div class="bg-[#33d69f14] text-[#33D69F] px-6 py-3 rounded-md flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#33D69F]"></span><span class="font-bold text-[12px]">Paid</span></div>`
          : inv.paymentStatus === "draft"
            ? `<div class="bg-[#97979714] text-[#373B53] dark:text-[#DFE3FA] px-6 py-3 rounded-md flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#373B53] dark:bg-[#DFE3FA]"></span><span class="font-bold text-[12px]">Draft</span></div>`
            : `<div class="bg-[#FF8F0014] text-[#FF8F00] px-6 py-3 rounded-md flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#FF8F00]"></span><span class="font-bold text-[12px]">Pending</span></div>`
        }
              <div class="view-btn cursor-pointer" data-index="${index}">
                <img src="./src/images/Path 5.png" alt="drop-down">
              </div>
            </div>
        </div>
      `;

      invoiceDisplay.appendChild(card);

      const openInvoiceDetails = () => {
        if (homeInvoice) homeInvoice.classList.add("hidden");
        invoiceDisplay.innerHTML = "";

        const existingModal = document.querySelector("#delete-confirmation-modal");
        if (existingModal) {
          existingModal.remove();
        }

        const view = document.createElement("div");
        view.className = `dynamic-bg dynamic-text w-full max-w-[730px] mx-auto`;

        view.innerHTML = `
          <div class="w-full h-full px-4 sm:px-6 lg:px-0 pb-24 md:pb-10">
              <button class="back-btn mb-6 md:mb-8 text-[#7C5DFA] hover:text-[#9277FF] font-bold flex gap-4 items-center transition-colors">
                  <img src="./src/images/go-back.svg" alt="go-back">
                  <h1 class="font-['League_Spartan'] font-bold text-[15px] leading-5 tracking-[-0.25px]">Go Back</h1>
              </button>

              <div class="dynamic-card dynamic-text dynamic-sub-text p-6 rounded-lg shadow-sm flex flex-row items-center w-full justify-between border border-transparent hover:border-[#7C5DFA] mb-4 font-['League_Spartan'] font-medium text-[13px] leading-3.75 tracking-[-0.1px]">
                  <div class="flex items-center justify-between w-full md:w-auto gap-5">
                      <span class="text-[#858BB2] text-[13px]">Status</span>
                      ${inv.paymentStatus === "paid"
            ? `<div class="bg-[#33d69f14] text-[#33D69F] px-6 py-3 rounded-md flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#33D69F]"></span><span class="font-bold text-[12px]">Paid</span></div>`
            : inv.paymentStatus === "draft"
              ? `<div class="bg-[#97979714] text-[#373B53] dark:text-[#DFE3FA] px-6 py-3 rounded-md flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#373B53] dark:bg-[#DFE3FA]"></span><span class="font-bold text-[12px]">Draft</span></div>`
              : `<div class="bg-[#FF8F0014] text-[#FF8F00] px-6 py-3 rounded-md flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#FF8F00]"></span><span class="font-bold text-[12px]">Pending</span></div>`
          }
                  </div>

                  <div class="hidden md:flex items-center gap-2 sm:gap-3">
                      <button id="edit-invoice" class="bg-[#F9FAFE] text-[#7E88C3] hover:bg-[#DFE3FA] px-6 h-12 rounded-full font-bold cursor-pointer transition-colors">Edit</button>
                      <button id="delete-invoice" class="bg-[#EC5757] text-white hover:bg-[#FF9797] px-6 h-12 rounded-full font-bold cursor-pointer transition-colors">Delete</button>
                      <button id="mark-paid-invoice" class="bg-[#7C5DFA] text-white hover:bg-[#9277FF] px-6 h-12 rounded-full font-bold cursor-pointer transition-colors">Mark as Paid</button>
                  </div>
              </div>

              <div class="dynamic-card dynamic-text dynamic-sub-text p-6 md:p-8 rounded-lg shadow-sm w-full border border-transparent mb-4 font-['League_Spartan'] font-medium text-[13px] tracking-[-0.1px]">
                  <div class="flex flex-col md:flex-row justify-between gap-6 md:gap-8 mb-8">
                      <div>
                          <h1 class="font-bold text-[16px] md:text-[20px] dynamic-text">#INV-${index + 1}</h1>
                          <p class="text-[#7E88C3] dynamic-sub-text text-[13px] mt-1">${inv.projectDescription}</p>
                      </div>
                      <div class="text-left md:text-right text-[#7E88C3] dynamic-sub-text text-[13px] leading-5">
                          <p>${inv.billFrom.street}</p>
                          <p>${inv.billFrom.city}</p>
                          <p>${inv.billFrom.postCode}</p>
                          <p>${inv.billFrom.country}</p>
                      </div>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 mb-10">
                      <div class="flex flex-col justify-between gap-4">
                          <div>
                              <p class="text-[#7E88C3] text-[13px] mb-2">Invoice Date</p>
                              <h2 class="font-bold text-[15px] dynamic-text">${inv.invoiceDate}</h2>
                          </div>
                          <div>
                              <p class="text-[#7E88C3] text-[13px] mb-2">Payment Due</p>
                              <h2 class="font-bold text-[15px] dynamic-text">${inv.paymentDueDate || inv.paymentTerms}</h2>
                          </div>
                      </div>

                      <div>
                          <p class="text-[#7E88C3] text-[13px] mb-2">Bill To</p>
                          <h2 class="font-bold text-[15px] dynamic-text mb-2">${inv.billTo.clientName}</h2>
                          <div class="text-[#7E88C3] dynamic-sub-text text-[13px] leading-5">
                              <p>${inv.billTo.streetAddress}</p>
                              <p>${inv.billTo.city}</p>
                              <p>${inv.billTo.postCode}</p>
                              <p>${inv.billTo.country}</p>
                          </div>
                      </div>

                      <div class="col-span-2 md:col-span-2">
                          <p class="text-[#7E88C3] text-[13px] mb-2">Sent to</p>
                          <h2 class="font-bold text-[15px] dynamic-text break-all">${inv.billTo.clientEmail}</h2>
                      </div>
                  </div>

                  <div class="dynamic-secondary rounded-t-lg p-6 mt-6">
                      <div class="hidden md:grid grid-cols-4 text-[#7E88C3] text-[13px] mb-6">
                          <div>Item Name</div>
                          <div class="text-center">QTY.</div>
                          <div class="text-right">Price</div>
                          <div class="text-right">Total</div>
                      </div>

                      <div class="flex flex-col gap-6">
                          ${inv.items.map(item => `
                              <div class="grid grid-cols-2 md:grid-cols-4 items-center justify-between font-bold">
                                  <div>
                                      <p class="dynamic-text text-[15px]">${item.name}</p>
                                      <p class="md:hidden text-[#7E88C3] text-[13px] mt-2">
                                          ${item.qty} x £ ${Number(item.price).toFixed(2)}
                                      </p>
                                  </div>
                                  <div class="hidden md:block text-center text-[#7E88C3] text-[15px]">${item.qty}</div>
                                  <div class="hidden md:block text-right text-[#7E88C3] text-[15px]">£ ${Number(item.price).toFixed(2)}</div>
                                  <div class="text-right dynamic-text text-[15px]">£ ${Number(item.total).toFixed(2)}</div>
                              </div>
                          `).join("")}
                      </div>
                  </div>

                  <div class="dynamic-view text-white p-6 rounded-b-lg flex items-center justify-between">
                      <p class="text-[13px] font-medium">Amount Due</p>
                      <h1 class="text-[20px] md:text-[24px] font-bold">£ ${totalAmount}</h1>
                  </div>
              </div>
          </div>

          <div class="fixed bottom-0 left-0 right-0 p-4 dynamic-card flex items-center justify-center gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden z-30">
              <button id="edit-invoice-mobile" class="flex-1 bg-[#F9FAFE] text-[#7E88C3] h-12 rounded-full font-bold cursor-pointer text-center text-[14px]">Edit</button>
              <button id="delete-invoice-mobile" class="flex-1 bg-[#EC5757] text-white h-12 rounded-full font-bold cursor-pointer text-center text-[14px]">Delete</button>
              <button id="mark-paid-invoice-mobile" class="flex-1 bg-[#7C5DFA] text-white h-12 rounded-full font-bold cursor-pointer text-center text-[14px]">Mark as Paid</button>
          </div>
        `;

        invoiceDisplay.appendChild(view);

        const backBtn = view.querySelector(".back-btn");
        backBtn.addEventListener("click", () => {
          if (homeInvoice) homeInvoice.classList.remove("hidden");
          renderInvoices();
        });

        const markPaidBtn = view.querySelector("#mark-paid-invoice");
        const markPaidBtnMobile = view.querySelector("#mark-paid-invoice-mobile");

        const handleMarkAsPaid = () => {
          inv.paymentStatus = "paid";
          // FIX 3: Save state updates when an invoice status changes to Paid
          localStorage.setItem("invoices", JSON.stringify(allInvoices));
          openInvoiceDetails();
        };

        if (markPaidBtn) markPaidBtn.addEventListener("click", handleMarkAsPaid);
        if (markPaidBtnMobile) markPaidBtnMobile.addEventListener("click", handleMarkAsPaid);

        const confirmationModal = document.createElement("div");
        confirmationModal.id = "delete-confirmation-modal";
        confirmationModal.className = "fixed inset-0 bg-black/50 flex items-center justify-center p-4 hidden z-50 transition-opacity";
        confirmationModal.innerHTML = `
          <div class="bg-white dark:bg-[#1E2139] p-8 rounded-lg max-w-120 w-full font-['League_Spartan'] shadow-md">
             <h1 class="text-[24px] font-bold text-[#0C0E16] dark:text-white mb-3">Confirm Deletion</h1>
             <p id="delete-modal-text" class="text-[13px] font-medium text-[#888EB0] dark:text-[#DFE3FA] leading-5 mb-6">
                Are you sure you want to delete invoice? This action cannot be undone.
             </p>
             <div class="flex justify-end gap-2">
                <button id="cancel-delete-btn" class="bg-[#F9FAFE] dark:bg-[#252945] text-[#7E88C3] dark:text-[#DFE3FA] hover:bg-[#DFE3FA] px-6 h-12 rounded-full font-bold transition-colors cursor-pointer">Cancel</button>
                <button id="confirm-delete-btn" class="bg-[#EC5757] text-white hover:bg-[#FF9797] px-6 h-12 rounded-full font-bold transition-colors cursor-pointer">Delete</button>
             </div>
          </div>
        `;
        document.body.appendChild(confirmationModal);

        const cancelDeleteBtn = confirmationModal.querySelector("#cancel-delete-btn");
        const confirmDeleteBtn = confirmationModal.querySelector("#confirm-delete-btn");
        const deleteModalText = confirmationModal.querySelector("#delete-modal-text");

        cancelDeleteBtn.addEventListener("click", () => {
          confirmationModal.classList.add("hidden");
        });

        const triggerDeleteConfirmation = () => {
          deleteModalText.textContent = `Are you sure you want to delete invoice #INV-${index + 1}? This action cannot be undone.`;
          confirmationModal.classList.remove("hidden");

          confirmDeleteBtn.addEventListener("click", () => {
            allInvoices.splice(index, 1);

            // FIX 4: Update localStorage to reflect removal when item is deleted
            localStorage.setItem("invoices", JSON.stringify(allInvoices));

            confirmationModal.classList.add("hidden");
            if (homeInvoice) homeInvoice.classList.remove("hidden");
            renderInvoices();
          }, { once: true });
        };

        const deleteBtn = view.querySelector("#delete-invoice");
        if (deleteBtn) deleteBtn.addEventListener("click", triggerDeleteConfirmation);

        const deleteBtnMobile = view.querySelector("#delete-invoice-mobile");
        if (deleteBtnMobile) deleteBtnMobile.addEventListener("click", triggerDeleteConfirmation);

        const editInvoice = view.querySelector("#edit-invoice");
        const editInvoiceMobile = view.querySelector("#edit-invoice-mobile");

        function loadInvoiceForEdit() {
          editingIndex = index;
          openInvoiceModal();

          document.querySelector('[name="fromStreet"]').value = inv.billFrom.street;
          document.querySelector('[name="city"]').value = inv.billFrom.city;
          document.querySelector('[name="postCode"]').value = inv.billFrom.postCode;
          document.querySelector('[name="country"]').value = inv.billFrom.country;

          document.querySelector('[name="clientName"]').value = inv.billTo.clientName;
          document.querySelector('[name="clientEmail"]').value = inv.billTo.clientEmail;
          document.querySelector('[name="StreetAddress"]').value = inv.billTo.streetAddress;
          document.querySelector('[name="city1"]').value = inv.billTo.city;
          document.querySelector('[name="postCode2"]').value = inv.billTo.postCode;
          document.querySelector('[name="country1"]').value = inv.billTo.country;

          // Uses the raw format cached value to populate the form HTML5 picker perfectly
          document.querySelector('[name="invoiceDate"]').value = formatToInputDate(inv.rawInvoiceDate || inv.invoiceDate);
          document.querySelector('[name="paymentTerms"]').value = inv.paymentTerms;
          document.querySelector('[name="paymentStatus"]').value = inv.paymentStatus;
          document.querySelector('[name="projectDescription"]').value = inv.projectDescription;

          itemList.innerHTML = "";
          inv.items.forEach((itemData) => {
            createItemRow();

            const rows = document.querySelectorAll(".item-row");
            const lastRow = rows[rows.length - 1];

            lastRow.querySelector(".item-name").value = itemData.name;
            lastRow.querySelector(".item-qty").value = itemData.qty;
            lastRow.querySelector(".item-price").value = itemData.price;
            lastRow.querySelector(".item-total").innerText = itemData.total;
          });
        }

        if (editInvoice) {
          editInvoice.addEventListener("click", loadInvoiceForEdit);
        }

        if (editInvoiceMobile) {
          editInvoiceMobile.addEventListener("click", loadInvoiceForEdit);
        }
      };

      card.addEventListener("click", openInvoiceDetails);
    });
  }
});