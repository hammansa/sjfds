class FDS_App_3D {
    // ... (FDS_App_3D class remains entirely unchanged)
}

class DriverApplicationHandler {
    constructor(container, serviceOptions, closeCallback) {
        // ... (constructor properties remain the same)
        
        // == UPDATED: Inputs mapping ==
        this.inputs = {
            name: container.querySelector('#driver-name'),
            // ... (other inputs)
            termsAgree: container.querySelector('#terms-agree'),
            certificateCaregiver: container.querySelector('#cert-caregiver'),
            certificateSocialWorker: container.querySelector('#cert-social-worker'),
            finalAgree: container.querySelector('#final-agree'),
        };
        
        this.certificateSection = container.querySelector('#certificate-section');

        // ... (buttons and other properties)
        this.init();
    }

    // ... (init, addEventListeners, goToStep, etc. are unchanged)
    
    // == UPDATED: This method now also handles the certificate section visibility ==
    updateTermsDisplay() {
        const selectedServices = Array.from(this.serviceSelectionContainer.querySelectorAll('input:checked')).map(cb => cb.value);
        
        // Show/Hide Certificate Section
        const hospitalEscortSelected = selectedServices.includes('병원동행');
        if (hospitalEscortSelected) {
            this.certificateSection.classList.remove('hidden');
        } else {
            this.certificateSection.classList.add('hidden');
            // Reset radio buttons if deselected
            this.inputs.certificateCaregiver.checked = false;
            this.inputs.certificateSocialWorker.checked = false;
        }

        if (selectedServices.length === 0) {
            this.serviceTermsDisplay.innerHTML = '<p>업무를 선택하면 여기에 해당 주의사항이 표시됩니다.</p>';
        } else {
            this.serviceTermsDisplay.innerHTML = selectedServices.map(name => `<p><b>[${name}]</b> ${this.serviceOptions[name].terms}</p>`).join('');
        }
        this.validateStep2();
    }

    // == UPDATED: Validation now checks for certificate selection if needed ==
    validateStep2() {
        const servicesSelected = this.serviceSelectionContainer.querySelector('input:checked');
        const termsAgreed = this.inputs.termsAgree.checked;
        
        let certificateValid = true; // Assume valid
        const hospitalEscortSelected = this.serviceSelectionContainer.querySelector('input[value="병원동행"]').checked;
        
        // If hospital escort is selected, a certificate must be chosen
        if (hospitalEscortSelected) {
            certificateValid = this.inputs.certificateCaregiver.checked || this.inputs.certificateSocialWorker.checked;
        }

        this.buttons.step2Next.disabled = !(servicesSelected && termsAgreed && certificateValid);
    }

    // == UPDATED: Final submission shows a conditional message ==
    handleFinalSubmit() {
        if (!this.inputs.finalAgree.checked) {
            alert('업무 제휴 협약서에 동의해야 합니다.');
            return;
        }

        const hospitalEscortApplied = this.serviceSelectionContainer.querySelector('input[value="병원동행"]').checked;
        let finalMessage = '저희와 파트너가 되심을 축하드립니다!';

        if (hospitalEscortApplied) {
            finalMessage += '\n\n[병원동행] 업무 지원자는 자격증(요양보호사 또는 사회복지사) 사본을 admin@fds.com 으로 제출해주시기 바랍니다.';
        }

        alert(finalMessage);
        this.closeCallback();
    }

    // == UPDATED: Reset also clears new radio buttons ==
    reset() {
        // ... (reset text inputs and checkboxes)
        this.certificateSection.classList.add('hidden');
        this.inputs.certificateCaregiver.checked = false;
        this.inputs.certificateSocialWorker.checked = false;
        // ... (rest of reset)
    }

    // ... (All other methods remain unchanged)
}

document.addEventListener('DOMContentLoaded', () => {
    new FDS_App_3D('#app-container');
});
