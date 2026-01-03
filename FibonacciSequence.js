import { CustomCost, ExponentialCost } from "./api/Costs";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "fibonacci_sequence";
var name = "Fibonacci Sequence";
var description =
    "Follow the whisper of Fibonacci numbers as they braid through time. " +
    "Grow rho with stepwise multipliers, cultivate F with recurrence, and " +
    "eventually uncover the Lucas and Tribonacci echoes hidden in the sequence.";
var authors = "aaatanas";
var version = 1;

const PHI_VALUE = (1 + Math.sqrt(5)) / 2;
const INV_PHI_VALUE = 1 / PHI_VALUE;
const SQRT5_VALUE = Math.sqrt(5);
const INV_SQRT5_VALUE = 1 / SQRT5_VALUE;

const phi = BigNumber.from(PHI_VALUE);
const sqrt5 = BigNumber.from(SQRT5_VALUE);

const milestoneRhoPowers = [10, 25, 50, 100, 150, 200, 250, 300, 400, 600];

var currency, currencyF, currencyL;

var t = BigNumber.ONE;

var c1, c2, n;
var c3, c4;
var f1, f2;
var l1, l2;
var m;

var c3Unlock, f1Unlock, f2Unlock, c2Base16Unlock, c2BasePhiUnlock;
var lucasUnlock, l1Unlock, l2Unlock, c4Unlock, tribonacciUnlock;

var tribonacciCache = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ONE];
var fibCostCache = [BigNumber.ZERO, BigNumber.ONE];
var lucasCostCache = [BigNumber.from(2), BigNumber.ONE];

var init = () => {
    currency = theory.createCurrency("ρ", "\\rho");
    currencyF = theory.createCurrency("F", "F");
    currencyL = theory.createCurrency("L", "L");

    ///////////////////
    // Regular Upgrades

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new CustomCost(level => Fibonacci(level), getFibCostC1Sum, getFibCostC1Max));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=" + getC2BaseDisplay() + "^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(2);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(21, Math.log2(21)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // n
    {
        let getDesc = (level) => "n=" + BigNumber.from(getN(level)).toString(0);
        let getInfo = (level) => "n=" + BigNumber.from(getN(level)).toString(0);
        n = theory.createUpgrade(2, currency, new ExponentialCost(3, Math.log2(3)));
        n.getDescription = (_) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
    }

    // c3
    {
        let getDesc = (level) => "c_3=2^{" + level + "}";
        let getInfo = (level) => "c_3=" + getC3(level).toString(0);
        c3 = theory.createUpgrade(3, currencyF, new ExponentialCost(987, Math.log2(987)));
        c3.getDescription = (_) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getInfo(c3.level), getInfo(c3.level + amount));
        c3.isAvailable = false;
    }

    // f1
    {
        let getDesc = (level) => "f_1=" + getF1(level).toString(0);
        let getInfo = (level) => "f_1=" + getF1(level).toString(0);
        f1 = theory.createUpgrade(4, currencyF, new CustomCost(level => Fibonacci(level + 1), getFibCostF1Sum, getFibCostF1Max));
        f1.getDescription = (_) => Utils.getMath(getDesc(f1.level));
        f1.getInfo = (amount) => Utils.getMathTo(getInfo(f1.level), getInfo(f1.level + amount));
        f1.isAvailable = false;
    }

    // f2
    {
        let getDesc = (level) => "f_2=3^{" + level + "}";
        let getInfo = (level) => "f_2=" + getF2(level).toString(0);
        f2 = theory.createUpgrade(5, currencyF, new ExponentialCost(1597, Math.log2(1597)));
        f2.getDescription = (_) => Utils.getMath(getDesc(f2.level));
        f2.getInfo = (amount) => Utils.getMathTo(getInfo(f2.level), getInfo(f2.level + amount));
        f2.isAvailable = false;
    }

    // m
    {
        let getDesc = (level) => "m=" + BigNumber.from(getM(level)).toString(0);
        let getInfo = (level) => "m=" + BigNumber.from(getM(level)).toString(0);
        m = theory.createUpgrade(6, currency, new CustomCost(getLucasCost, getLucasCostSum, getLucasCostMax));
        m.getDescription = (_) => Utils.getMath(getDesc(m.level));
        m.getInfo = (amount) => Utils.getMathTo(getInfo(m.level), getInfo(m.level + amount));
        m.isAvailable = false;
    }

    // l1
    {
        let getDesc = (level) => "l_1=" + getL1(level).toString(0);
        let getInfo = (level) => "l_1=" + getL1(level).toString(0);
        l1 = theory.createUpgrade(7, currencyF, new CustomCost(getLucasCost, getLucasCostSum, getLucasCostMax));
        l1.getDescription = (_) => Utils.getMath(getDesc(l1.level));
        l1.getInfo = (amount) => Utils.getMathTo(getInfo(l1.level), getInfo(l1.level + amount));
        l1.isAvailable = false;
    }

    // l2
    {
        let getDesc = (level) => "l_2=5^{" + level + "}";
        let getInfo = (level) => "l_2=" + getL2(level).toString(0);
        l2 = theory.createUpgrade(8, currencyF, new ExponentialCost(1, Math.log2(2584)));
        l2.getDescription = (_) => Utils.getMath(getDesc(l2.level));
        l2.getInfo = (amount) => Utils.getMathTo(getInfo(l2.level), getInfo(l2.level + amount));
        l2.isAvailable = false;
    }

    // c4
    {
        let getDesc = (level) => "c_4=\\varphi^{" + level + "}";
        let getInfo = (level) => "c_4=" + getC4(level).toString(2);
        c4 = theory.createUpgrade(9, currencyL, new ExponentialCost(1, Math.log2(4181)));
        c4.getDescription = (_) => Utils.getMath(getDesc(c4.level));
        c4.getInfo = (amount) => Utils.getMathTo(getInfo(c4.level), getInfo(c4.level + amount));
        c4.isAvailable = false;
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e5);
    theory.createBuyAllUpgrade(1, currency, 1e8);
    theory.createAutoBuyerUpgrade(2, currency, 1e13);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new CustomCost(level => BigNumber.from(getMilestoneCost(level))));

    {
        c3Unlock = theory.createMilestoneUpgrade(0, 1);
        c3Unlock.description = "Unlock $c_3$";
        c3Unlock.info = "Adds $c_3$ to $\\dot{\\rho}$";
        c3Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
    }

    {
        f1Unlock = theory.createMilestoneUpgrade(1, 1);
        f1Unlock.description = "Unlock $f_1$";
        f1Unlock.info = "$\\dot{F}=f_1F_n$";
        f1Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        f1Unlock.isAvailable = false;
    }

    {
        f2Unlock = theory.createMilestoneUpgrade(2, 1);
        f2Unlock.description = "Unlock $f_2$";
        f2Unlock.info = "$\\dot{F}=f_1f_2F_n$";
        f2Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        f2Unlock.isAvailable = false;
    }

    {
        c2Base16Unlock = theory.createMilestoneUpgrade(3, 1);
        c2Base16Unlock.description = "Set $c_2$ base to 1.6";
        c2Base16Unlock.info = "$c_2=1.6^x$";
        c2Base16Unlock.boughtOrRefunded = (_) => { invalidateEquations(); };
        c2Base16Unlock.isAvailable = false;
    }

    {
        c2BasePhiUnlock = theory.createMilestoneUpgrade(4, 1);
        c2BasePhiUnlock.description = "Set $c_2$ base to $\\varphi$";
        c2BasePhiUnlock.info = "$c_2=\\varphi^x$";
        c2BasePhiUnlock.boughtOrRefunded = (_) => { invalidateEquations(); };
        c2BasePhiUnlock.isAvailable = false;
    }

    {
        lucasUnlock = theory.createMilestoneUpgrade(5, 1);
        lucasUnlock.description = "Unlock Lucas currency";
        lucasUnlock.info = "$\\dot{L}=L_m$";
        lucasUnlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        lucasUnlock.isAvailable = false;
    }

    {
        l1Unlock = theory.createMilestoneUpgrade(6, 1);
        l1Unlock.description = "Unlock $l_1$";
        l1Unlock.info = "$\\dot{F}=f_1f_2l_1F_n$";
        l1Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        l1Unlock.isAvailable = false;
    }

    {
        l2Unlock = theory.createMilestoneUpgrade(7, 1);
        l2Unlock.description = "Unlock $l_2$";
        l2Unlock.info = "$\\dot{F}=f_1f_2l_1l_2F_n$";
        l2Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        l2Unlock.isAvailable = false;
    }

    {
        c4Unlock = theory.createMilestoneUpgrade(8, 1);
        c4Unlock.description = "Unlock $c_4$";
        c4Unlock.info = "Adds $c_4$ to $\\dot{\\rho}$";
        c4Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        c4Unlock.isAvailable = false;
    }

    {
        tribonacciUnlock = theory.createMilestoneUpgrade(9, 1);
        tribonacciUnlock.description = "Unlock Tribonacci term";
        tribonacciUnlock.info = "Add $T_{\\lfloor t^{0.1}\\rfloor}$";
        tribonacciUnlock.boughtOrRefunded = (_) => { invalidateEquations(); };
        tribonacciUnlock.isAvailable = false;
    }

    ///////////////////
    //// Story chapters
    let story1 = "";
    story1 += "A pinecone rolls across your desk, its scales spiraling in two directions.\n";
    story1 += "You count the spirals and the numbers grin back at you.\n";
    story1 += "A new factor seems to hum in the margin of your notes.\n";
    story1 += "You name it c_3 and let the spiral breathe.\n";
    theory.createStoryChapter(0, "Seed Spiral", story1, () => c3Unlock.level > 0);

    let story2 = "";
    story2 += "A farmer shares a ledger of rabbits and the rhythm of their months.\n";
    story2 += "Each line grows from the two before it, plain and perfect.\n";
    story2 += "You coin f_1 to keep time with the births.\n";
    theory.createStoryChapter(1, "Rabbit Ledger", story2, () => f1Unlock.level > 0);

    let story3 = "";
    story3 += "Two streams of growth twist together like braided twine.\n";
    story3 += "The pattern doubles its confidence, asking for a second guide.\n";
    story3 += "You introduce f_2 and the current steadies.\n";
    theory.createStoryChapter(2, "Twin Currents", story3, () => f2Unlock.level > 0);

    let story4 = "";
    story4 += "Your ratio refuses to settle at 1.5.\n";
    story4 += "It tilts a little higher, closer to a secret you almost remember.\n";
    story4 += "You nudge c_2 to 1.6 and watch the notes brighten.\n";
    theory.createStoryChapter(3, "Rough Ratio", story4, () => c2Base16Unlock.level > 0);

    let story5 = "";
    story5 += "Shells, waves, and leaves keep whispering the same name.\n";
    story5 += "The golden ratio arrives like a well-timed knock.\n";
    story5 += "You let c_2 speak in phi, and the room goes quiet.\n";
    theory.createStoryChapter(4, "Golden Whisper", story5, () => c2BasePhiUnlock.level > 0);

    let story6 = "";
    story6 += "A colleague slides you a note labeled Lucas.\n";
    story6 += "It is a sibling sequence, warm with familiarity.\n";
    story6 += "You light a new currency, L, and wick it with m.\n";
    theory.createStoryChapter(5, "Lucas Lantern", story6, () => lucasUnlock.level > 0);

    let story7 = "";
    story7 += "Leaves fall in alternating counts, never quite Fibonacci.\n";
    story7 += "The Lucas rhythm shows a different kind of harmony.\n";
    story7 += "You craft l_1 to amplify the chorus.\n";
    theory.createStoryChapter(6, "Leafy Multipliers", story7, () => l1Unlock.level > 0);

    let story8 = "";
    story8 += "A bell tower rings in a pattern of threes.\n";
    story8 += "Each chime stacks on the last two, but with its own twist.\n";
    story8 += "You add l_2 and the resonance deepens.\n";
    theory.createStoryChapter(7, "Chiming Steps", story8, () => l2Unlock.level > 0);

    let story9 = "";
    story9 += "The rho equation feels crowded but incomplete.\n";
    story9 += "A fourth companion steps in from the Lucas lantern.\n";
    story9 += "You welcome c_4, and the march keeps time.\n";
    theory.createStoryChapter(8, "Fourth Companion", story9, () => c4Unlock.level > 0);

    let story10 = "";
    story10 += "A dream arrives in three-beat steps, not two.\n";
    story10 += "The Tribonacci rhythm waltzes through your notes.\n";
    story10 += "You write the term down and feel the sequence breathe.\n";
    theory.createStoryChapter(9, "Tribonacci Dream", story10, () => tribonacciUnlock.level > 0);

    updateAvailability();
};

var invalidateEquations = () => {
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
};

var updateAvailability = () => {
    f1Unlock.isAvailable = c3Unlock.level > 0;
    f2Unlock.isAvailable = f1Unlock.level > 0;
    c2Base16Unlock.isAvailable = f2Unlock.level > 0;
    c2BasePhiUnlock.isAvailable = c2Base16Unlock.level > 0;
    lucasUnlock.isAvailable = c2BasePhiUnlock.level > 0;
    l1Unlock.isAvailable = lucasUnlock.level > 0;
    l2Unlock.isAvailable = l1Unlock.level > 0;
    c4Unlock.isAvailable = l2Unlock.level > 0;
    tribonacciUnlock.isAvailable = c4Unlock.level > 0;

    c3.isAvailable = c3Unlock.level > 0;
    f1.isAvailable = f1Unlock.level > 0;
    f2.isAvailable = f2Unlock.level > 0;
    m.isAvailable = lucasUnlock.level > 0;
    l1.isAvailable = l1Unlock.level > 0;
    l2.isAvailable = l2Unlock.level > 0;
    c4.isAvailable = c4Unlock.level > 0;
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    t += dt;

    let tFactor = t.max(BigNumber.ONE).pow(-0.5);
    let rhoTerm = getC1(c1.level) * getC2(c2.level) * tFactor;

    if (c3Unlock.level > 0)
        rhoTerm *= getC3(c3.level);

    if (c4Unlock.level > 0)
        rhoTerm *= getC4(c4.level);

    if (tribonacciUnlock.level > 0)
        rhoTerm += getTribonacciNumber(getTribonacciIndex());

    currency.value += dt * bonus * rhoTerm;

    let fn = getFibonacciNumber(getN(n.level));
    let fMultiplier = BigNumber.ONE;

    if (f1Unlock.level > 0)
        fMultiplier *= getF1(f1.level);

    if (f2Unlock.level > 0)
        fMultiplier *= getF2(f2.level);

    if (l1Unlock.level > 0)
        fMultiplier *= getL1(l1.level);

    if (l2Unlock.level > 0)
        fMultiplier *= getL2(l2.level);

    currencyF.value += dt * bonus * fMultiplier * fn;

    if (lucasUnlock.level > 0) {
        let lm = getLucasNumber(getM(m.level));
        currencyL.value += dt * bonus * lm;
    }

    theory.invalidateSecondaryEquation();
};

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho}=c_1c_2";

    if (c3Unlock.level > 0)
        result += "c_3";

    if (c4Unlock.level > 0)
        result += "c_4";

    result += "t^{-0.5}";

    if (tribonacciUnlock.level > 0)
        result += "+T_{\\lfloor t^{0.1}\\rfloor}";

    return result;
};

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 64;
    theory.secondaryEquationScale = 1.0;

    let multiplier = "";

    if (f1Unlock.level > 0) multiplier += "f_1";
    if (f2Unlock.level > 0) multiplier += "f_2";
    if (l1Unlock.level > 0) multiplier += "l_1";
    if (l2Unlock.level > 0) multiplier += "l_2";

    let result = "\\begin{matrix}";
    result += "\\dot{F}=" + multiplier + "F_n";
    result += "\\\\";
    result += "\\dot{t}=1";
    result += "\\\\";
    result += "t=" + t.toString(2);

    if (lucasUnlock.level > 0) {
        result += "\\\\";
        result += "\\dot{L}=L_m";
    }

    result += "\\end{matrix}";
    return result;
};

var getTertiaryEquation = () => "";

var getPublicationMultiplier = (tau) => BigNumber.from(5) * tau.pow(BigNumber.from(INV_SQRT5_VALUE));
var getPublicationMultiplierFormula = (symbol) => "5" + symbol + "^{1/\\sqrt{5}}";
var getTau = () => currency.value.pow(BigNumber.from(INV_PHI_VALUE));
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(BigNumber.from(PHI_VALUE)), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
var isCurrencyVisible = (index) => index == 0 ||
    (index == 1 && (n.level > 0 || c3Unlock.level > 0 || f1Unlock.level > 0 || f2Unlock.level > 0 || l1Unlock.level > 0 || l2Unlock.level > 0)) ||
    (index == 2 && lucasUnlock.level > 0);

var getMilestoneCost = (level) => {
    if (level < 0 || level >= milestoneRhoPowers.length)
        return 1e9;

    return milestoneRhoPowers[level] * INV_PHI_VALUE;
};

var getC1 = (level) => Utils.getStepwisePowerSum(level, 8, 13, 0);

var getC2BaseDisplay = () => {
    if (c2BasePhiUnlock && c2BasePhiUnlock.level > 0) return "\\varphi";
    if (c2Base16Unlock && c2Base16Unlock.level > 0) return "1.6";
    return "1.5";
};

var getC2Base = () => {
    if (c2BasePhiUnlock && c2BasePhiUnlock.level > 0) return phi;
    if (c2Base16Unlock && c2Base16Unlock.level > 0) return BigNumber.from(1.6);
    return BigNumber.from(1.5);
};

var getC2 = (level) => getC2Base().pow(level);
var getC3 = (level) => BigNumber.TWO.pow(level);
var getC4 = (level) => phi.pow(level);

var getF1 = (level) => Utils.getStepwisePowerSum(level, 34, 55, 1);
var getF2 = (level) => BigNumber.THREE.pow(level);
var getL1 = (level) => Utils.getStepwisePowerSum(level, 89, 144, 1);
var getL2 = (level) => BigNumber.FIVE.pow(level);

var getN = (level) => level;
var getM = (level) => level;

var getPsiPow = (n) => {
    let sign = n % 2 == 0 ? BigNumber.ONE : BigNumber.from(-1);
    return sign * phi.pow(BigNumber.from(-n));
};

var ensureFibCostCache = (n) => {
    for (let i = fibCostCache.length; i <= n; i++) {
        fibCostCache.push(fibCostCache[i - 1] + fibCostCache[i - 2]);
    }
};

var ensureLucasCostCache = (n) => {
    for (let i = lucasCostCache.length; i <= n; i++) {
        lucasCostCache.push(lucasCostCache[i - 1] + lucasCostCache[i - 2]);
    }
};

var Fibonacci = (n) => {
    ensureFibCostCache(n);
    return fibCostCache[n];
};

var getLucasNumberCached = (index) => {
    ensureLucasCostCache(index);
    return lucasCostCache[index];
};

var isLessOrEqual = (left, right) => (left - right).sign <= 0;

var getMaxFromCost = (fromLevel, currency, sumFn) => {
    let available = BigNumber.from(currency);
    if (available.sign <= 0) return 0;

    let low = 0;
    let high = 1;

    while (isLessOrEqual(sumFn(fromLevel, high), available)) {
        low = high;
        high *= 2;
        if (high > 1e9) break;
    }

    while (low + 1 < high) {
        let mid = Math.floor((low + high) / 2);
        if (isLessOrEqual(sumFn(fromLevel, mid), available)) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return low;
};

var getFibCostC1Sum = (fromLevel, amount) => {
    if (amount <= 0) return BigNumber.ZERO;
    return Fibonacci(fromLevel + amount + 1) - Fibonacci(fromLevel + 1);
};

var getFibCostC1Max = (fromLevel, currency) => getMaxFromCost(fromLevel, currency, getFibCostC1Sum);

var getFibCostF1Sum = (fromLevel, amount) => {
    if (amount <= 0) return BigNumber.ZERO;
    return Fibonacci(fromLevel + amount + 2) - Fibonacci(fromLevel + 2);
};

var getFibCostF1Max = (fromLevel, currency) => getMaxFromCost(fromLevel, currency, getFibCostF1Sum);

var getLucasCost = (level) => getLucasNumberCached(level);
var getLucasCostSum = (fromLevel, amount) => {
    if (amount <= 0) return BigNumber.ZERO;
    return getLucasNumberCached(fromLevel + amount + 1) - getLucasNumberCached(fromLevel + 1);
};
var getLucasCostMax = (fromLevel, currency) => getMaxFromCost(fromLevel, currency, getLucasCostSum);

// Closed-form Fibonacci and Lucas numbers using phi.
var getFibonacciNumber = (n) => {
    if (n <= 0) return BigNumber.ZERO;
    let phiPow = phi.pow(BigNumber.from(n));
    let psiPow = getPsiPow(n);
    return (phiPow - psiPow) / sqrt5;
};

var getLucasNumber = (n) => {
    if (n < 0) return BigNumber.ZERO;
    let phiPow = phi.pow(BigNumber.from(n));
    let psiPow = getPsiPow(n);
    return phiPow + psiPow;
};

var getTribonacciIndex = () => {
    let raw = t.max(BigNumber.ONE).pow(0.1).toNumber();
    if (!isFinite(raw) || raw < 0) return 0;
    return Math.floor(raw);
};

var getTribonacciNumber = (n) => {
    if (n < 0) return BigNumber.ZERO;

    for (let i = tribonacciCache.length; i <= n; i++) {
        let next = tribonacciCache[i - 1] + tribonacciCache[i - 2] + tribonacciCache[i - 3];
        tribonacciCache.push(next);
    }

    return tribonacciCache[n];
};

var getResetStageMessage = () => "Reset current publication? This will reset rho, F, L, and t.";
var canResetStage = () => true;
var resetStage = () => {
    for (let i = 0; i < theory.upgrades.length; i++) {
        theory.upgrades[i].level = 0;
    }

    currency.value = BigNumber.ZERO;
    currencyF.value = BigNumber.ZERO;
    currencyL.value = BigNumber.ZERO;
    t = BigNumber.ONE;
    tribonacciCache = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ONE];
    theory.clearGraph();
    updateAvailability();
    invalidateEquations();
};

var postPublish = () => {
    t = BigNumber.ONE;
    tribonacciCache = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ONE];
};

init();
