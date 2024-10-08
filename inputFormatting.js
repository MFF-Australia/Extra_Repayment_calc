document.addEventListener("DOMContentLoaded", function () {
    const formatCurrency = (input) => {
        const value = parseFloat(input.value.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
            input.value = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(Math.round(value));
        }
    };

    const formatPercentage = (input) => {
        const value = parseFloat(input.value.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
            input.value = `${value}%`;
        }
    };

    const formatYears = (input) => {
        const value = parseInt(input.value.replace(/[^\d]/g, ''), 10);
        if (!isNaN(value)) {
            if (value > 1)
                input.value = `${value} years`;
            else
                input.value = `${value} year`;


        }
    };

    const principalInput = document.getElementById("principal");
    const annualRateInput = document.getElementById("annualRate");
    const loanTermInput = document.getElementById("loanTerm");
    const extraContributionInput = document.getElementById("extraContribution");
    const startAfterYearsInput = document.getElementById("startAfterYears");

    const preserveValueOnInvalidInput = (input, formatFunction) => {
        const originalValue = input.value;
        formatFunction(input);
        if (input.value === "") {
            input.value = originalValue;
        }
    };

    principalInput.addEventListener("blur", function () {
        preserveValueOnInvalidInput(principalInput, formatCurrency);
    });

    annualRateInput.addEventListener("blur", function () {
        preserveValueOnInvalidInput(annualRateInput, formatPercentage);
    });

    loanTermInput.addEventListener("blur", function () {
        preserveValueOnInvalidInput(loanTermInput, formatYears);
    });

    extraContributionInput.addEventListener("blur", function () {
        preserveValueOnInvalidInput(extraContributionInput, formatCurrency);
    });

    startAfterYearsInput.addEventListener("blur", function () {
        preserveValueOnInvalidInput(startAfterYearsInput, formatYears);
    });
});
