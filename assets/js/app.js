/**
 * FinCore - App Logic
 */

document.addEventListener('DOMContentLoaded', function () {
    
    // --- 1. Sidebar Toggle Logic ---
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }

    // --- 2. Auto Active Menu Handling ---
    const currentPath = window.location.pathname.split("/").pop();
    
    // Find link matching current path
    const navLinks = document.querySelectorAll('#sidebar ul li a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            // Activate the link
            link.classList.add('active');

            // If it's a submenu item, expand the parent
            const parentList = link.closest('ul.collapse');
            if (parentList) {
                parentList.classList.add('show');
                // Highlight parent toggle
                const parentToggle = document.querySelector(`a[href="#${parentList.id}"]`);
                if (parentToggle) {
                    parentToggle.classList.add('active'); // Optional: highlight parent
                    parentToggle.setAttribute('aria-expanded', 'true');
                }
            }
        }
    });

    // --- 3. Journal Entry Logic (Only for journal.html) ---
    const journalTableBody = document.getElementById('journalItemsBody');
    if (journalTableBody) {
        
        // Add Row
        document.getElementById('addRowBtn').addEventListener('click', function() {
            const rowCount = journalTableBody.rows.length;
            const newRow = `
                <tr>
                    <td>
                        <select class="form-select">
                            <option selected>Choose Account...</option>
                            <option value="1001">1001 - Kas Besar</option>
                            <option value="1002">1002 - Bank BCA</option>
                            <option value="4001">4001 - Pendapatan Jasa</option>
                            <option value="5001">5001 - Perlengkapan Kantor</option>
                        </select>
                    </td>
                    <td><input type="text" class="form-control" placeholder="Keterangan"></td>
                    <td>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control debit-input" value="0">
                        </div>
                    </td>
                    <td>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control credit-input" value="0">
                        </div>
                    </td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-danger remove-row"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
            journalTableBody.insertAdjacentHTML('beforeend', newRow);
        });

        // Event Delegation for Inputs (Calculation) and Delete
        journalTableBody.addEventListener('click', function(e) {
            if (e.target.closest('.remove-row')) {
                e.target.closest('tr').remove();
                calculateJournalTotals();
            }
        });

        journalTableBody.addEventListener('input', function(e) {
            if (e.target.classList.contains('debit-input') || e.target.classList.contains('credit-input')) {
                // Ensure mutual exclusivity (basic logic)
                const row = e.target.closest('tr');
                const debit = row.querySelector('.debit-input');
                const credit = row.querySelector('.credit-input');

                if (e.target === debit && parseFloat(debit.value) > 0) credit.value = 0;
                if (e.target === credit && parseFloat(credit.value) > 0) debit.value = 0;

                calculateJournalTotals();
            }
        });

        function calculateJournalTotals() {
            let totalDebit = 0;
            let totalCredit = 0;

            document.querySelectorAll('.debit-input').forEach(input => {
                totalDebit += parseFloat(input.value) || 0;
            });
            document.querySelectorAll('.credit-input').forEach(input => {
                totalCredit += parseFloat(input.value) || 0;
            });

            // Use ID-ID locale for Rupiah formatting
            document.getElementById('totalDebit').innerText = totalDebit.toLocaleString('id-ID');
            document.getElementById('totalCredit').innerText = totalCredit.toLocaleString('id-ID');

            // Validation State
            const balanceMsg = document.getElementById('balanceMessage');
            if (Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0) {
                balanceMsg.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-check-circle"></i> Balanced</span>';
                document.getElementById('btnSubmitJournal').disabled = false;
            } else {
                const diff = Math.abs(totalDebit - totalCredit).toLocaleString('id-ID');
                balanceMsg.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-circle"></i> Unbalanced (Diff: ${diff})</span>`;
                document.getElementById('btnSubmitJournal').disabled = true;
            }
        }
    }
});
