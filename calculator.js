document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    executeCalculations();
    updateChart();
});

function setupEventListeners() {
    const inputs = document.querySelectorAll('#principal, #annualRate, #loanTerm, #extraContribution, #startAfterYears');
    inputs.forEach(input => input.addEventListener('change', handleInputChange));
    document.getElementById('printButton').addEventListener('click', handlePrint);
    document.getElementById('assumptionsButton').addEventListener('click', () => toggleModal('assumptionsModal', true));
    document.querySelector('.close').addEventListener('click', () => toggleModal('assumptionsModal', false));
    window.addEventListener('click', (event) => {
        if (event.target == document.getElementById('assumptionsModal')) {
            toggleModal('assumptionsModal', false);
        }
    });
}

function handleInputChange() {
    executeCalculations();
    updateChart();
}

function handlePrint() {
    const container = document.querySelector("#calculator-container");
    const originalBackgroundColor = container.style.backgroundColor;
    container.style.backgroundColor = '#238870';

    html2canvas(container).then(canvas => {
        container.style.backgroundColor = originalBackgroundColor;
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'calculator_screenshot.png';
        link.click();
    });
}

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    modal.style.display = show ? 'block' : 'none';
}

function cleanInput(input) {
    return parseFloat(input.replace(/[^\d.-]/g, '')) || 0;
}

function calculateMonthlyInterestRate(annualRate) {
    return annualRate / 12 / 100;
}

function calculateMonthlyRepayment(principal, annualRate, loanTerm) {
    const monthlyRate = calculateMonthlyInterestRate(annualRate);
    const termInMonths = loanTerm * 12;
    return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termInMonths));
}

function calculateTotalRepayment(principal, annualRate, loanTerm, extraContribution, startAfterYears, monthlyRepayment) {
    const monthlyRate = calculateMonthlyInterestRate(annualRate);
    const termInMonths = loanTerm * 12;
    const startAfterMonths = startAfterYears * 12;
    let totalRepayment = 0;
    let currentBalance = principal;

    for (let month = 0; month < termInMonths; month++) {
        if (currentBalance > 0) {
            const interestForThisMonth = currentBalance * monthlyRate;
            currentBalance += interestForThisMonth; // Add interest to the balance before payment
        }

        if (month >= startAfterMonths && extraContribution > 0) {
            const adjustedExtra = Math.min(extraContribution, currentBalance);
            currentBalance -= adjustedExtra;
            totalRepayment += adjustedExtra;
        }

        const principalPayment = Math.min(monthlyRepayment, currentBalance);
        currentBalance -= principalPayment;
        totalRepayment += principalPayment;

        if (currentBalance <= 0) break; // Check if loan is paid off
    }

    return totalRepayment;
}

function calculateInterestSaved(principal, annualRate, loanTerm, extraContribution, startAfterYears) {
    const monthlyRepayment = calculateMonthlyRepayment(principal, annualRate, loanTerm);
    const totalRepaymentWithoutExtra = monthlyRepayment * loanTerm * 12;
    const totalRepaymentWithExtra = calculateTotalRepayment(principal, annualRate, loanTerm, extraContribution, startAfterYears, monthlyRepayment);
    return (totalRepaymentWithoutExtra - principal) - (totalRepaymentWithExtra - principal);
}

function calculateTimeSaved(principal, annualRate, loanTerm, extraContribution, startAfterYears, monthlyRepayment) {
    const monthlyRate = calculateMonthlyInterestRate(annualRate);
    const termInMonths = loanTerm * 12;
    const startAfterMonths = startAfterYears * 12;
    let currentBalance = principal;
    let month = 0;

    while (currentBalance > 0 && month < termInMonths) {
        currentBalance = (currentBalance * (1 + monthlyRate)) - monthlyRepayment;
        month++;
    }
    const totalMonthsWithoutExtra = month;

    currentBalance = principal;
    month = 0;

    while (currentBalance > 0 && month < termInMonths) {
        if (month >= startAfterMonths) {
            currentBalance -= extraContribution;
        }
        currentBalance = (currentBalance * (1 + monthlyRate)) - monthlyRepayment;
        if (currentBalance < 0) currentBalance = 0;
        month++;
    }
    return totalMonthsWithoutExtra - month;
}

function executeCalculations() {
    const principal = cleanInput(document.getElementById('principal').value);
    const annualRate = cleanInput(document.getElementById('annualRate').value);
    const loanTerm = cleanInput(document.getElementById('loanTerm').value);
    const extraContribution = cleanInput(document.getElementById('extraContribution').value);
    const startAfterYears = cleanInput(document.getElementById('startAfterYears').value);

    const monthlyRepayment = calculateMonthlyRepayment(principal, annualRate, loanTerm);
    const interestSaved = calculateInterestSaved(principal, annualRate, loanTerm, extraContribution, startAfterYears);
    const timeSaved = calculateTimeSaved(principal, annualRate, loanTerm, extraContribution, startAfterYears, monthlyRepayment);
    const yearsSaved = Math.floor(timeSaved / 12);
    const monthsSaved = timeSaved % 12;

    /*     document.getElementById('minimumRepayments').textContent = `$${monthlyRepayment.toFixed(2)}`;
        document.getElementById('increasedRepayments').textContent = `$${(monthlyRepayment + extraContribution).toFixed(2)}`;
        document.getElementById('timeSaved').textContent = `${yearsSaved} years and ${monthsSaved} months`;
        document.getElementById('interestSaved').textContent = `$${interestSaved.toFixed(2)}`; */
    const usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    document.getElementById('minimumRepayments').textContent = usdFormatter.format(monthlyRepayment);
    document.getElementById('increasedRepayments').textContent = usdFormatter.format(monthlyRepayment + extraContribution);
    document.getElementById('timeSaved').textContent = `${yearsSaved} year${yearsSaved !== 1 ? 's' : ''} and ${monthsSaved} month${monthsSaved !== 1 ? 's' : ''}`;
    document.getElementById('interestSaved').textContent = usdFormatter.format(interestSaved);

}

function calculateLoanBalance() {
    const principal = cleanInput(document.getElementById('principal').value);
    const annualRate = cleanInput(document.getElementById('annualRate').value);
    const termYears = cleanInput(document.getElementById('loanTerm').value);
    const extraContribution = cleanInput(document.getElementById('extraContribution').value);
    const startAfterYears = cleanInput(document.getElementById('startAfterYears').value);
    const monthlyRate = calculateMonthlyInterestRate(annualRate);
    const monthlyRepayment = calculateMonthlyRepayment(principal, annualRate, termYears);
    const startAfterMonths = startAfterYears * 12;
    let balanceWithExtra = principal;
    let balanceWithoutExtra = principal;
    const dataWithExtra = [{ x: 0, y: balanceWithExtra }];
    const dataWithoutExtra = [{ x: 0, y: balanceWithoutExtra }];

    for (let year = 0; year <= termYears; year++) {
        for (let month = 1; month <= 12; month++) {
            const repaymentWithExtra = monthlyRepayment + (year >= startAfterYears ? extraContribution : 0);
            balanceWithExtra = balanceWithExtra * (1 + monthlyRate) - repaymentWithExtra;
            balanceWithoutExtra = balanceWithoutExtra * (1 + monthlyRate) - monthlyRepayment;

            balanceWithExtra = Math.max(0, balanceWithExtra);
            balanceWithoutExtra = Math.max(0, balanceWithoutExtra);
        }

        dataWithExtra.push({ x: year + 1, y: balanceWithExtra });
        dataWithoutExtra.push({ x: year +1 , y: balanceWithoutExtra });

        if (balanceWithExtra === 0 && balanceWithoutExtra === 0) break;
    }

    return { dataWithExtra, dataWithoutExtra };
}

function updateChart() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded.');
        return;
    }

    const { dataWithExtra, dataWithoutExtra } = calculateLoanBalance();
    const ctx = document.getElementById('loanBalanceChart').getContext('2d');
    if (window.loanBalanceChart instanceof Chart) {
        window.loanBalanceChart.destroy();
    }
    window.loanBalanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'With Extra',
                data: dataWithExtra,
                backgroundColor: 'rgba(60,190,216, 0.2)',
                borderColor: 'rgba(60,190,216, 1)',
                fill: true,
                borderWidth: 2,
                pointRadius: 3
            }, {
                label: 'Without Extra',
                data: dataWithoutExtra,
                backgroundColor: 'rgba(211, 211, 211, 0.2)',
                borderColor: 'rgba(128, 128, 128, 1)',
                fill: true,
                borderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Years'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount Owing ($)'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6,
                        callback: function (value) {
                            return value <= 2000 ? `$${value.toFixed(0)}` : `$${(value / 1000).toFixed(0)}k`;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    usePointStyle: true,
                    callbacks: {
                        label: function (context) {
                            const amount = `$${Math.round(context.parsed.y).toLocaleString()}`;
                            const year = context.dataIndex;
                            return [`Amount: ${amount}`, `Year: ${year}`];
                        }
                    },
                    backgroundColor: function (context) {
                        const datasetIndex = context.tooltip.dataPoints[0].datasetIndex;
                        return context.chart.data.datasets[datasetIndex].borderColor;
                    },
                    borderColor: function (context) {
                        const datasetIndex = context.tooltip.dataPoints[0].datasetIndex;
                        return context.chart.data.datasets[datasetIndex].borderColor;
                    },
                    borderWidth: 1,
                    titleFont: { size: 0 },
                    titleMarginBottom: 0,
                }
            }
        }
    });
}
