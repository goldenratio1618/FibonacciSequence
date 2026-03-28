import { CustomCost, ExponentialCost } from "./api/Costs";
import { BigNumber, parseBigNumber } from "./api/BigNumber";
import { QuaternaryEntry, theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "fibonacci_sequence";
var name = "Fibonacci Sequence";
var description =
    "Follow the whisper of Fibonacci numbers as they braid through time. " +
    "Grow rho with stepwise multipliers, cultivate F with recurrence, and " +
    "eventually uncover the Lucas and Tribonacci echoes hidden in the sequence.";
var authors = "aaatanas";
var version = 12;

const PHI_VALUE = (1 + Math.sqrt(5)) / 2;
const INV_PHI_VALUE = 1 / PHI_VALUE;
const SQRT5_VALUE = Math.sqrt(5);
const INV_SQRT5_VALUE = 1 / SQRT5_VALUE;

const phi = BigNumber.from(PHI_VALUE);
const sqrt5 = BigNumber.from(SQRT5_VALUE);

const milestoneRhoPowers = [8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

var currency, currencyF, currencyL;

var t = BigNumber.ONE;

var c1, c2, n;
var c3, c4;
var f1, f2;
var l1, l2;
var m;

var c3Unlock, lucasUnlock, fUnlock, lUnlock, c2BaseUnlock, tribonacciUnlock;

var tribonacciCache = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ONE];
var fibCostCache = [BigNumber.ZERO, BigNumber.ONE];
var lucasCostCache = [BigNumber.from(2), BigNumber.ONE];
var quaternaryEntries = [];
var equationPage = 1;
var lastTickMultiplier = BigNumber.ONE;

var isLucasCurrencyUnlocked = () => lucasUnlock && lucasUnlock.level > 0;
var isL1Unlocked = () => lUnlock && lUnlock.level > 0;
var isL2Unlocked = () => lUnlock && lUnlock.level > 1;
var isF1Unlocked = () => fUnlock && fUnlock.level > 0;
var isF2Unlocked = () => fUnlock && fUnlock.level > 1;
var isC2Base117Unlocked = () => c2BaseUnlock && c2BaseUnlock.level > 0;
var isC2Base16Unlocked = () => c2BaseUnlock && c2BaseUnlock.level > 1;
var isC2BasePhiUnlocked = () => c2BaseUnlock && c2BaseUnlock.level > 2;
var isTribonacciUnlocked = () => tribonacciUnlock && tribonacciUnlock.level > 0;
var hasAllMilestonesBeforeLucas = () => c3Unlock && c3Unlock.level > 0;
var hasAllMilestonesBeforeF = () => hasAllMilestonesBeforeLucas() && isLucasCurrencyUnlocked();
var hasAllMilestonesBeforeL = () => hasAllMilestonesBeforeF() && isF2Unlocked();
var hasAllMilestonesBeforeC2Base = () => hasAllMilestonesBeforeL() && isL2Unlocked();
var hasAllMilestonesBeforeTribonacci = () => hasAllMilestonesBeforeC2Base() && isC2BasePhiUnlocked();

var getGroupedMilestoneDescription = (level, descriptions) => descriptions[Math.min(level, descriptions.length - 1)];
var getMilestoneTransitionInfo = (level, amount, states) => {
    let from = states[Math.min(level, states.length - 1)];
    let to = states[Math.min(level + amount, states.length - 1)];
    return "$" + from + "$ --> $" + to + "$";
};
var canRefundC3Milestone = (_) => lucasUnlock.level == 0 && fUnlock.level == 0 && lUnlock.level == 0 && c2BaseUnlock.level == 0 && tribonacciUnlock.level == 0;
var canRefundLucasMilestone = (_) => fUnlock.level == 0 && lUnlock.level == 0 && c2BaseUnlock.level == 0 && tribonacciUnlock.level == 0;
var canRefundFMilestone = (_) => lUnlock.level == 0 && c2BaseUnlock.level == 0 && tribonacciUnlock.level == 0;
var canRefundLMilestone = (_) => c2BaseUnlock.level == 0 && tribonacciUnlock.level == 0;
var canRefundC2BaseMilestone = (_) => tribonacciUnlock.level == 0;

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
        let getDesc = (level) => "c_2=" + getC2PurchaseBaseDisplay() + "^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(2);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(21, Math.log2(21)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // c3
    {
        let getDesc = (level) => "c_3=2^{" + level + "}";
        let getInfo = (level) => "c_3=" + getC3(level).toString(0);
        c3 = theory.createUpgrade(4, currencyF, new ExponentialCost(987, Math.log2(610)));
        c3.getDescription = (_) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getInfo(c3.level), getInfo(c3.level + amount));
        c3.isAvailable = false;
    }

    // c4
    {
        let getDesc = (level) => "c_4=3^{" + level + "}";
        let getInfo = (level) => "c_4=" + getC4(level).toString(2);
        c4 = theory.createUpgrade(9, currencyL, new ExponentialCost(1, Math.log2(987)));
        c4.getDescription = (_) => Utils.getMath(getDesc(c4.level));
        c4.getInfo = (amount) => Utils.getMathTo(getInfo(c4.level), getInfo(c4.level + amount));
        c4.isAvailable = false;
    }

    // n
    {
        let getDesc = (level) => "n=" + BigNumber.from(getN(level)).toString(0);
        let getInfo = (level) => "n=" + BigNumber.from(getN(level)).toString(0);
        n = theory.createUpgrade(2, currency, new ExponentialCost(3, Math.log2(3)));
        n.getDescription = (_) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
        n.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateQuaternaryValues(); };
    }

    // m
    {
        let getDesc = (level) => "m=" + BigNumber.from(getM(level)).toString(0);
        let getInfo = (level) => "m=" + BigNumber.from(getM(level)).toString(0);
        m = theory.createUpgrade(3, currency, new ExponentialCost(2, Math.log2(5)));
        m.getDescription = (_) => Utils.getMath(getDesc(m.level));
        m.getInfo = (amount) => Utils.getMathTo(getInfo(m.level), getInfo(m.level + amount));
        m.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateQuaternaryValues(); };
        m.isAvailable = false;
    }

    // f1
    {
        let getDesc = (level) => "f_1=" + getF1(level).toString(0);
        let getInfo = (level) => "f_1=" + getF1(level).toString(0);
        f1 = theory.createUpgrade(5, currencyF, new CustomCost(level => Fibonacci(level + 1), getFibCostF1Sum, getFibCostF1Max));
        f1.getDescription = (_) => Utils.getMath(getDesc(f1.level));
        f1.getInfo = (amount) => Utils.getMathTo(getInfo(f1.level), getInfo(f1.level + amount));
        f1.isAvailable = false;
    }

    // f2
    {
        let getDesc = (level) => "f_2=5^{" + level + "}";
        let getInfo = (level) => "f_2=" + getF2(level).toString(0);
        f2 = theory.createUpgrade(6, currencyF, new ExponentialCost(2584, Math.log2(14930352)));
        f2.getDescription = (_) => Utils.getMath(getDesc(f2.level));
        f2.getInfo = (amount) => Utils.getMathTo(getInfo(f2.level), getInfo(f2.level + amount));
        f2.isAvailable = false;
    }

    // l1
    {
        let getDesc = (level) => "l_1=" + getL1(level).toString(0);
        let getInfo = (level) => "l_1=" + getL1(level).toString(0);
        l1 = theory.createUpgrade(7, currencyL, new CustomCost(getLucasCost, getLucasCostSum, getLucasCostMax));
        l1.getDescription = (_) => Utils.getMath(getDesc(l1.level));
        l1.getInfo = (amount) => Utils.getMathTo(getInfo(l1.level), getInfo(l1.level + amount));
        l1.isAvailable = false;
    }

    // l2
    {
        let getDesc = (level) => "l_2=4^{" + level + "}";
        let getInfo = (level) => "l_2=" + getL2(level).toString(0);
        l2 = theory.createUpgrade(8, currencyL, new ExponentialCost(1, Math.log2(87403803)));
        l2.getDescription = (_) => Utils.getMath(getDesc(l2.level));
        l2.getInfo = (amount) => Utils.getMathTo(getInfo(l2.level), getInfo(l2.level + amount));
        l2.isAvailable = false;
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
        c3Unlock.canBeRefunded = canRefundC3Milestone;
        c3Unlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
    }

    {
        lucasUnlock = theory.createMilestoneUpgrade(1, 1);
        lucasUnlock.description = "Unlock Lucas currency";
        lucasUnlock.info = "$\\dot{L}=L_m$";
        lucasUnlock.canBeRefunded = canRefundLucasMilestone;
        lucasUnlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        lucasUnlock.isAvailable = false;
    }

    {
        fUnlock = theory.createMilestoneUpgrade(2, 2);
        fUnlock.getDescription = (_) => getGroupedMilestoneDescription(fUnlock.level, [
            "Unlock $f_1$",
            "Unlock $f_2$"
        ]);
        fUnlock.getInfo = (amount) => getMilestoneTransitionInfo(fUnlock.level, amount, [
            "\\dot{F}=F_n",
            "\\dot{F}=f_1F_n",
            "\\dot{F}=f_1f_2F_n"
        ]);
        fUnlock.canBeRefunded = canRefundFMilestone;
        fUnlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        fUnlock.isAvailable = false;
    }

    {
        lUnlock = theory.createMilestoneUpgrade(3, 2);
        lUnlock.getDescription = (_) => getGroupedMilestoneDescription(lUnlock.level, [
            "Unlock $l_1$",
            "Unlock $l_2$"
        ]);
        lUnlock.getInfo = (amount) => getMilestoneTransitionInfo(lUnlock.level, amount, [
            "\\dot{L}=L_m",
            "\\dot{L}=l_1L_m",
            "\\dot{L}=l_1l_2L_m"
        ]);
        lUnlock.canBeRefunded = canRefundLMilestone;
        lUnlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        lUnlock.isAvailable = false;
    }

    {
        c2BaseUnlock = theory.createMilestoneUpgrade(4, 3);
        c2BaseUnlock.getDescription = (_) => getGroupedMilestoneDescription(c2BaseUnlock.level, [
            "Set $c_2$ base to $\\left(\\frac{11}{7}\\right)$",
            "Set $c_2$ base to 1.6",
            "Set $c_2$ base to $\\varphi$"
        ]);
        c2BaseUnlock.getInfo = (amount) => getMilestoneTransitionInfo(c2BaseUnlock.level, amount, [
            "c_2=1.5^x",
            "c_2=\\left(\\frac{11}{7}\\right)^x",
            "c_2=1.6^x",
            "c_2=\\varphi^x"
        ]);
        c2BaseUnlock.canBeRefunded = canRefundC2BaseMilestone;
        c2BaseUnlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        c2BaseUnlock.isAvailable = false;
    }

    {
        tribonacciUnlock = theory.createMilestoneUpgrade(5, 1);
        tribonacciUnlock.description = "Unlock Tribonacci term";
        tribonacciUnlock.info = "Multiply by $T_k$, where $k=\\lfloor t^{0.2}\\rfloor$";
        tribonacciUnlock.boughtOrRefunded = (_) => { invalidateEquations(); updateAvailability(); };
        tribonacciUnlock.isAvailable = false;
    }

    ///////////////////
    //// Story chapters
    let story0 = "";
    story0 += "You walk outside on a bright spring day, to your favorite meadow.\n";
    story0 += "You see a family of rabbits there.\n";
    story0 += "You could swear there were more rabbits than when you visited a week ago.\n";
    story0 += "How fast can a rabbit population grow?\n";
    story0 += "You create a term called 'rho' to find out.";
    theory.createStoryChapter(0, "Springtime Rabbits", story0, () => c1.level == 0);

    let story1 = "";
    story1 += "You've been making good progress on your theory.\n";
    story1 += "You assume that all adult rabbits have a bunny every week,\n";
    story1 += "and rabbits also take a week to mature from bunnies to adults.\n";
    story1 += "Then the number of rabbits is given by a recurrence relationship.\n";
    story1 += "You decide to call the numbers that come out of this equation Fibonacci numbers.\n";
    story1 += "Using your newfound knowledge, you add a new term to link it to your equation.\n";
    theory.createStoryChapter(1, "Recurrence Relations", story1, () => c3Unlock.level > 0);

    let story2 = "";
    story2 += "You idly sit at your desk when you notice two spiders crawl across it.\n";
    story2 += "It is a sibling sequence, warm with familiarity.\n";
    story2 += "You light a new currency, L, and wick it with m.\n";
    theory.createStoryChapter(2, "Spiders", story2, () => isLucasCurrencyUnlocked());

    let story3 = "";
    story3 += "A farmer shares a ledger of rabbits and the rhythm of their months.\n";
    story3 += "Each line grows from the two before it, plain and perfect.\n";
    story3 += "You coin f_1 to keep time with the births.\n";
    theory.createStoryChapter(3, "Rabbit Ledger", story3, () => isF1Unlocked());

    let story4 = "";
    story4 += "Two streams of growth twist together like braided twine.\n";
    story4 += "The pattern doubles its confidence, asking for a second guide.\n";
    story4 += "You introduce f_2 and the current steadies.\n";
    theory.createStoryChapter(4, "Twin Currents", story4, () => isF2Unlocked());

    let story5 = "";
    story5 += "Leaves fall in alternating counts, never quite Fibonacci.\n";
    story5 += "The Lucas rhythm shows a different kind of harmony.\n";
    story5 += "You craft l_1 to amplify the chorus.\n";
    theory.createStoryChapter(5, "Leafy Multipliers", story5, () => isL1Unlocked());

    let story6 = "";
    story6 += "A bell tower rings in a pattern of threes.\n";
    story6 += "Each chime stacks on the last two, but with its own twist.\n";
    story6 += "You add l_2 and the resonance deepens.\n";
    theory.createStoryChapter(6, "Chiming Steps", story6, () => isL2Unlocked());

    let story7 = "";
    story7 += "A scratched note in the margin reads 11 over 7.\n";
    story7 += "It is not the truth, but it points the right way.\n";
    story7 += "You let c_2 lean into the fraction and watch the pattern sharpen.\n";
    theory.createStoryChapter(7, "Fractional Hint", story7, () => isC2Base117Unlocked());

    let story8 = "";
    story8 += "Your ratio refuses to settle at 11/7.\n";
    story8 += "It tilts a little higher, closer to a secret you almost remember.\n";
    story8 += "You nudge c_2 to 1.6 and watch the notes brighten.\n";
    theory.createStoryChapter(8, "Rough Ratio", story8, () => isC2Base16Unlocked());

    let story9 = "";
    story9 += "Shells, waves, and leaves keep whispering the same name.\n";
    story9 += "The golden ratio arrives like a well-timed knock.\n";
    story9 += "You let c_2 speak in phi, and the room goes quiet.\n";
    theory.createStoryChapter(9, "Golden Whisper", story9, () => isC2BasePhiUnlocked());

    let story10 = "";
    story10 += "A dream arrives in three-beat steps, not two.\n";
    story10 += "The Tribonacci rhythm waltzes through your notes.\n";
    story10 += "You write the term down and feel the sequence breathe.\n";
    theory.createStoryChapter(10, "Tribonacci Dream", story10, () => tribonacciUnlock.level > 0);

    updateAvailability();
};

var invalidateEquations = () => {
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
};

var getDefinitionEquation = () => {
    let lines = [];
    lines.push("F_0=0,\\quad F_1=1,\\quad F_n=F_{n-1}+F_{n-2}");

    if (isLucasCurrencyUnlocked())
        lines.push("L_0=2,\\quad L_1=1,\\quad L_n=L_{n-1}+L_{n-2}");

    if (isTribonacciUnlocked())
        lines.push("k=\\lfloor t^{0.2}\\rfloor,\\quad T_0=0,\\quad T_1=0,\\quad T_2=1,\\quad T_k=T_{k-1}+T_{k-2}+T_{k-3}");

    lines.push("\\dot{t}=" + (c1.level > 0 ? "1" : "0"));

    return "\\begin{matrix}" + lines.join("\\\\") + "\\end{matrix}";
};

var getDefinitionValuesEquation = () => {
    let lines = [];
    lines.push("F_n=" + getFibonacciNumber(getN(n.level)).toString(2));

    if (isLucasCurrencyUnlocked())
        lines.push("L_m=" + getLucasNumber(getM(m.level)).toString(2));

    return "\\begin{matrix}" + lines.join("\\\\") + "\\end{matrix}";
};

var updateAvailability = () => {
    let lucasMaxLevel = hasAllMilestonesBeforeLucas() ? 1 : 0;
    lucasUnlock.maxLevel = Math.max(lucasUnlock.level, lucasMaxLevel);
    lucasUnlock.isAvailable = hasAllMilestonesBeforeLucas() || lucasUnlock.level > 0;

    let fMaxLevel = hasAllMilestonesBeforeF() ? 2 : 0;
    fUnlock.maxLevel = Math.max(fUnlock.level, fMaxLevel);
    fUnlock.isAvailable = hasAllMilestonesBeforeF() || fUnlock.level > 0;

    let lMaxLevel = hasAllMilestonesBeforeL() ? 2 : 0;
    lUnlock.maxLevel = Math.max(lUnlock.level, lMaxLevel);
    lUnlock.isAvailable = hasAllMilestonesBeforeL() || lUnlock.level > 0;

    let c2BaseMaxLevel = hasAllMilestonesBeforeC2Base() ? 3 : 0;
    c2BaseUnlock.maxLevel = Math.max(c2BaseUnlock.level, c2BaseMaxLevel);
    c2BaseUnlock.isAvailable = hasAllMilestonesBeforeC2Base() || c2BaseUnlock.level > 0;

    let tribonacciMaxLevel = hasAllMilestonesBeforeTribonacci() ? 1 : 0;
    tribonacciUnlock.maxLevel = Math.max(tribonacciUnlock.level, tribonacciMaxLevel);
    tribonacciUnlock.isAvailable = hasAllMilestonesBeforeTribonacci() || tribonacciUnlock.level > 0;

    c3.isAvailable = c3Unlock.level > 0;
    f1.isAvailable = isF1Unlocked();
    f2.isAvailable = isF2Unlocked();
    m.isAvailable = isLucasCurrencyUnlocked();
    l1.isAvailable = isL1Unlocked();
    l2.isAvailable = isL2Unlocked();
    c4.isAvailable = isLucasCurrencyUnlocked();
    theory.invalidateQuaternaryValues();
};

var getIncomeMultiplier = () => theory.publicationMultiplier * lastTickMultiplier;

var getBaseRhoDot = () => {
    let value = getC1(c1.level) * getC2(c2.level) * t.max(BigNumber.ONE).pow(-0.3);

    if (c3Unlock.level > 0)
        value *= getC3(c3.level);

    if (isLucasCurrencyUnlocked())
        value *= getC4(c4.level);

    if (isTribonacciUnlocked())
        value *= getTribonacciNumber(getTribonacciIndex());

    return value;
};

var getRhoDot = () => getBaseRhoDot() * getIncomeMultiplier();

var getBaseFDot = () => {
    let value = getFibonacciNumber(getN(n.level));

    if (isF1Unlocked())
        value *= getF1(f1.level);

    if (isF2Unlocked())
        value *= getF2(f2.level);

    return value;
};

var getFDot = () => getBaseFDot() * getIncomeMultiplier();

var getBaseLDot = () => {
    if (!isLucasCurrencyUnlocked())
        return null;

    if (c1.level == 0)
        return BigNumber.ZERO;

    let value = getLucasNumber(getM(m.level));

    if (isL1Unlocked())
        value *= getL1(l1.level);

    if (isL2Unlocked())
        value *= getL2(l2.level);

    return value;
};

var getLDot = () => {
    let base = getBaseLDot();
    return base === null ? null : base * getIncomeMultiplier();
};

var tick = (elapsedTime, multiplier) => {
    lastTickMultiplier = BigNumber.from(multiplier);
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    if (c1.level > 0)
        t += dt;

    let rhoDot = getBaseRhoDot();
    currency.value += dt * bonus * rhoDot;

    let fDot = getBaseFDot();
    currencyF.value += dt * bonus * fDot;

    if (isLucasCurrencyUnlocked()) {
        currencyL.value += dt * bonus * getBaseLDot();
    }

    theory.invalidateSecondaryEquation();
    theory.invalidateQuaternaryValues();
};

var getPrimaryEquation = () => {
    if (equationPage == 0) {
        theory.primaryEquationHeight = isLucasCurrencyUnlocked() ? 64 : 40;
        theory.primaryEquationScale = 1;
        return getDefinitionValuesEquation();
    }

    theory.primaryEquationHeight = 40;
    theory.primaryEquationScale = 1;
    let result = "\\dot{\\rho}=c_1c_2";

    if (c3Unlock.level > 0)
        result += "c_3";

    if (isLucasCurrencyUnlocked())
        result += "c_4";

    if (isTribonacciUnlocked())
        result += "T_k";

    result += "t^{-0.3}";

    return result;
};

var getSecondaryEquation = () => {
    if (equationPage == 0) {
        theory.secondaryEquationHeight = isTribonacciUnlocked() ? 120 : (isLucasCurrencyUnlocked() ? 88 : 56);
        theory.secondaryEquationScale = isTribonacciUnlocked() ? 0.72 : 0.82;
        return getDefinitionEquation();
    }

    theory.secondaryEquationHeight = isLucasCurrencyUnlocked() ? 40 : 20;
    theory.secondaryEquationScale = 1.0;

    let multiplier = "";

    if (isF1Unlocked()) multiplier += "f_1";
    if (isF2Unlocked()) multiplier += "f_2";

    let result = "\\begin{matrix}";
    result += "\\dot{F}=" + multiplier + "F_n";

    if (isLucasCurrencyUnlocked()) {
        result += "\\\\";
        let lMultiplier = "";
        if (isL1Unlocked()) lMultiplier += "l_1";
        if (isL2Unlocked()) lMultiplier += "l_2";
        result += "\\dot{L}=" + lMultiplier + "L_m";
    }

    result += "\\end{matrix}";
    return result;
};

var getTertiaryEquation = () => theory.latexSymbol + "=\\max\\rho^{1/\\varphi}";

var getQuaternaryEntries = () => {
    quaternaryEntries = [];

    quaternaryEntries.push(new QuaternaryEntry("\\dot{\\rho}", getRhoDot().toString(2)));
    quaternaryEntries.push(new QuaternaryEntry("\\dot{F}", getFDot().toString(2)));

    if (isLucasCurrencyUnlocked()) {
        let lDot = getLDot();
        quaternaryEntries.push(new QuaternaryEntry("\\dot{L}", lDot ? lDot.toString(2) : BigNumber.ZERO.toString(2)));
    }

    quaternaryEntries.push(new QuaternaryEntry("t", t.toString(2)));

    if (isTribonacciUnlocked()) {
        let tribonacciIndex = getTribonacciIndex();
        quaternaryEntries.push(new QuaternaryEntry("k", tribonacciIndex.toString()));
        quaternaryEntries.push(new QuaternaryEntry("T_k", getTribonacciNumber(tribonacciIndex).toString(2)));
    }

    return quaternaryEntries;
};

var getPublicationMultiplier = (tau) => tau.pow(BigNumber.from(INV_SQRT5_VALUE));
var getPublicationMultiplierFormula = (symbol) => symbol + "^{1/\\sqrt{5}}";
var getTau = () => currency.value.pow(BigNumber.from(INV_PHI_VALUE));
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(BigNumber.from(PHI_VALUE)), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
var isCurrencyVisible = (index) => index == 0 ||
    (index == 1 && (n.level > 0 || c3Unlock.level > 0 || isF1Unlocked() || isF2Unlocked() || isL1Unlocked() || isL2Unlocked())) ||
    (index == 2 && isLucasCurrencyUnlocked());

var getMilestoneCost = (level) => {
    if (level < 0 || level >= milestoneRhoPowers.length)
        return 1e9;

    return milestoneRhoPowers[level] * INV_PHI_VALUE;
};

var getC1 = (level) => Utils.getStepwisePowerSum(level, 8, 13, 0);

var getC2BaseDisplay = () => {
    if (isC2BasePhiUnlocked()) return "\\varphi";
    if (isC2Base16Unlocked()) return "1.6";
    if (isC2Base117Unlocked()) return "11/7";
    return "1.5";
};

var getC2PurchaseBaseDisplay = () => {
    if (isC2Base117Unlocked()) return "(11/7)";
    return getC2BaseDisplay();
};

var getC2Base = () => {
    if (isC2BasePhiUnlocked()) return phi;
    if (isC2Base16Unlocked()) return BigNumber.from(1.6);
    if (isC2Base117Unlocked()) return BigNumber.from(11 / 7);
    return BigNumber.from(1.5);
};

var getC2 = (level) => getC2Base().pow(level);
var getC3 = (level) => BigNumber.TWO.pow(level);
var getC4 = (level) => BigNumber.THREE.pow(level);

var getF1 = (level) => Utils.getStepwisePowerSum(level, 21, 34, 1);
var getF2 = (level) => BigNumber.FIVE.pow(level);
var getL1 = (level) => Utils.getStepwisePowerSum(level, 29, 47, 1);
var getL2 = (level) => BigNumber.FOUR.pow(level);

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
    let raw = t.max(BigNumber.ONE).pow(0.2).toNumber();
    if (!isFinite(raw) || raw < 2) return 2;
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

var getInternalState = () => `${t.toBase64String()} ${equationPage}`;

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0 && values[0].length > 0) {
        try {
            t = BigNumber.fromBase64String(values[0]);
        } catch (_) {
            t = parseBigNumber(values[0]);
        }
    }
    equationPage = values.length > 1 ? Math.max(0, Math.min(1, parseInt(values[1]) || 1)) : 1;
    lastTickMultiplier = BigNumber.ONE;
    invalidateEquations();
    theory.invalidateQuaternaryValues();
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
    equationPage = 1;
    lastTickMultiplier = BigNumber.ONE;
    tribonacciCache = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ONE];
    theory.clearGraph();
    updateAvailability();
    invalidateEquations();
    theory.invalidateQuaternaryValues();
};

var postPublish = () => {
    t = BigNumber.ONE;
    equationPage = 1;
    lastTickMultiplier = BigNumber.ONE;
    tribonacciCache = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ONE];
    invalidateEquations();
    theory.invalidateQuaternaryValues();
};

var canGoToPreviousStage = () => equationPage > 0;
var goToPreviousStage = () => {
    equationPage -= 1;
    invalidateEquations();
};
var canGoToNextStage = () => equationPage < 1;
var goToNextStage = () => {
    equationPage += 1;
    invalidateEquations();
};

init();
