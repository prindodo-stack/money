import {
  Transaction,
  EventConfig,
  SettlementReport,
  MemberSettlement,
  TransferPlan,
  MemberTransactionShare,
} from '../types';

export function calculateSettlement(
  transactions: Transaction[],
  members: string[],
  totalBudget: number = 0
): SettlementReport {
  // Collect all unique participants from transactions + members list
  const memberSet = new Set<string>(members.filter(Boolean));
  transactions.forEach((t) => {
    if (t.payer) memberSet.add(t.payer);
    t.participants.forEach((p) => memberSet.add(p));
  });

  const allMembers = Array.from(memberSet);

  // Initialize summary for each member
  const memberStats: Record<
    string,
    {
      paid: number;
      incomeReceived: number;
      share: number;
      participatedCount: number;
      paidCount: number;
      breakdown: MemberTransactionShare[];
    }
  > = {};

  allMembers.forEach((m) => {
    memberStats[m] = {
      paid: 0,
      incomeReceived: 0,
      share: 0,
      participatedCount: 0,
      paidCount: 0,
      breakdown: [],
    };
  });

  let totalExpense = 0;
  let totalIncome = 0;

  // Process all transactions
  transactions.forEach((t) => {
    if (t.type === 'EXPENSE') {
      totalExpense += t.amount;

      // Payer gets credit for paying
      if (memberStats[t.payer]) {
        memberStats[t.payer].paid += t.amount;
        memberStats[t.payer].paidCount += 1;
      } else {
        memberStats[t.payer] = {
          paid: t.amount,
          incomeReceived: 0,
          share: 0,
          participatedCount: 0,
          paidCount: 1,
          breakdown: [],
        };
      }

      // Each participant shares the cost
      const validParticipants = t.participants.length > 0 ? t.participants : allMembers;
      const sharePerPerson = Math.round(t.amount / (validParticipants.length || 1));

      validParticipants.forEach((p) => {
        if (!memberStats[p]) {
          memberStats[p] = {
            paid: 0,
            incomeReceived: 0,
            share: 0,
            participatedCount: 0,
            paidCount: 0,
            breakdown: [],
          };
        }
        memberStats[p].share += sharePerPerson;
        memberStats[p].participatedCount += 1;
        memberStats[p].breakdown.push({
          transactionId: t.id,
          date: t.date,
          description: t.description,
          category: t.category,
          totalAmount: t.amount,
          payer: t.payer,
          participantCount: validParticipants.length,
          myShare: sharePerPerson,
        });
      });
    } else if (t.type === 'INCOME') {
      totalIncome += t.amount;
      if (memberStats[t.payer]) {
        memberStats[t.payer].incomeReceived += t.amount;
      } else {
        memberStats[t.payer] = {
          paid: 0,
          incomeReceived: t.amount,
          share: 0,
          participatedCount: 0,
          paidCount: 0,
          breakdown: [],
        };
      }
    }
  });

  // Calculate Net Balances
  const memberSummaries: MemberSettlement[] = allMembers.map((name) => {
    const stats = memberStats[name] || {
      paid: 0,
      incomeReceived: 0,
      share: 0,
      participatedCount: 0,
      paidCount: 0,
      breakdown: [],
    };
    const netBalance = Math.round(stats.paid - stats.share - stats.incomeReceived);
    return {
      name,
      totalPaid: Math.round(stats.paid),
      totalIncomeReceived: Math.round(stats.incomeReceived),
      totalShare: Math.round(stats.share),
      netBalance,
      participatedCount: stats.participatedCount,
      paidCount: stats.paidCount,
      breakdown: stats.breakdown,
    };
  });

  // Sort summaries: creditors (receive) first, then debtors (send)
  memberSummaries.sort((a, b) => b.netBalance - a.netBalance);

  // Minimal Debt Simplification Algorithm
  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];

  memberSummaries.forEach((m) => {
    if (m.netBalance < -1) {
      debtors.push({ name: m.name, amount: -m.netBalance });
    } else if (m.netBalance > 1) {
      creditors.push({ name: m.name, amount: m.netBalance });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: TransferPlan[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount >= 1) {
      transfers.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(transferAmount),
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount < 1) i++;
    if (creditor.amount < 1) j++;
  }

  const remainingBudget = totalBudget > 0 ? totalBudget - totalExpense : 0;
  const budgetBurnRate = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  return {
    totalBudget,
    totalExpense,
    totalIncome,
    remainingBudget,
    budgetBurnRate,
    netBalance: totalIncome - totalExpense,
    memberCount: allMembers.length,
    memberSummaries,
    transfers,
    generatedAt: new Date().toLocaleString('ko-KR'),
  };
}

export function generateSettlementText(
  report: SettlementReport,
  config: EventConfig
): string {
  const lines: string[] = [];

  lines.push(`📋 [${config.title || '행사 경비 정산서'}]`);
  lines.push(`📅 정산일시: ${report.generatedAt}`);
  lines.push(`👥 총 인원: ${report.memberCount}명`);
  lines.push('────────────────────────');

  if (config.totalBudget > 0) {
    lines.push(`🎯 총 예산: ${config.totalBudget.toLocaleString()}원`);
    lines.push(`💰 총 지출: ${report.totalExpense.toLocaleString()}원 (${report.budgetBurnRate.toFixed(1)}% 집행)`);
    if (report.remainingBudget >= 0) {
      lines.push(`🟢 잔여 예산(남은 잔액): ${report.remainingBudget.toLocaleString()}원`);
    } else {
      lines.push(`🔴 예산 초과 지출: ${Math.abs(report.remainingBudget).toLocaleString()}원 초과!`);
    }
  } else {
    lines.push(`💰 총 지출: ${report.totalExpense.toLocaleString()}원`);
  }

  if (report.totalIncome > 0) {
    lines.push(`💵 총 수입: ${report.totalIncome.toLocaleString()}원`);
    lines.push(`📊 수지 잔액: ${report.netBalance.toLocaleString()}원`);
  }
  lines.push('────────────────────────');
  lines.push('📌 [1/N 개인별 분담 및 정산]');

  report.memberSummaries.forEach((m) => {
    const sign =
      m.netBalance > 0
        ? `+${m.netBalance.toLocaleString()}원 받기`
        : m.netBalance < 0
        ? `${m.netBalance.toLocaleString()}원 보내기`
        : '정산 완료(0원)';
    lines.push(
      `• ${m.name}: 내 몫(분담액) ${m.totalShare.toLocaleString()}원 (직접결제 ${m.totalPaid.toLocaleString()}원) 👉 ${sign}`
    );
  });

  lines.push('────────────────────────');
  lines.push('💸 [최소 송금 안내]');

  if (report.transfers.length === 0) {
    lines.push('🎉 모든 금액이 완벽하게 정산되었습니다! (송금 필요 없음)');
  } else {
    report.transfers.forEach((t, idx) => {
      lines.push(`${idx + 1}. ${t.from} ➡️ ${t.to} : ${t.amount.toLocaleString()}원`);
    });
  }

  if (config.bankName || config.accountNumber) {
    lines.push('────────────────────────');
    lines.push('🏦 [입금 계좌]');
    lines.push(
      `${config.bankName || ''} ${config.accountNumber || ''} (예금주: ${
        config.accountHolder || '총무'
      })`
    );
  }

  if (config.settlementMemo) {
    lines.push(`📝 메모: ${config.settlementMemo}`);
  }

  lines.push('────────────────────────');
  lines.push('✨ 행사 경비 및 예산 관리 앱에서 생성되었습니다.');

  return lines.join('\n');
}
