import {
  Claim,
  ChatMessage,
  Kpis,
  MonthCount,
  StageCount,
  Stage,
  STAGES,
  TypeCount,
} from './types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/*  All API functions below read from this in-memory dataset so the    */
/*  app can be wired to a real backend later by swapping the bodies.   */
/* ------------------------------------------------------------------ */

const documentsFor = (prefix: string, n: number): Claim['documents'] => {
  const types: Claim['documents'][number]['type'][] = ['pdf', 'image', 'policy', 'report'];
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-doc-${i + 1}`,
    name:
      i === 0
        ? `${prefix}_claim_form.pdf`
        : i === 1
          ? `${prefix}_photos_${i}.png`
          : i === 2
            ? `${prefix}_policy_schedule.pdf`
            : `${prefix}_adjuster_report.pdf`,
    type: types[i % types.length],
    pages: 2 + ((i * 3) % 9),
    uploadedAt: `2026-0${(i % 9) + 1}-1${(i % 8) + 1}`,
    sizeKb: 120 + i * 87,
  }));
};

const timelineFor = (current: Stage, filedDate: string, closedDate: string | null): Claim['timeline'] => {
  const idx = STAGES.indexOf(current);
  return STAGES.map((stage, i) => {
    if (i < idx) {
      return {
        stage,
        status: 'done',
        timestamp: `2026-0${(i % 9) + 1}-${10 + i}T09:00:00Z`,
        note: `Completed ${stage.toLowerCase()} processing.`,
      };
    }
    if (i === idx) {
      return {
        stage,
        status: 'current',
        timestamp: closedDate ?? filedDate,
        note: `Currently in ${stage.toLowerCase()}.`,
      };
    }
    return { stage, status: 'pending', timestamp: null, note: 'Awaiting previous stage.' };
  });
};

const chatFor = (id: string, type: string, amount: number): Claim['chat'] => {
  const base: ChatMessage[] = [
    {
      id: `${id}-m1`,
      role: 'assistant',
      text: `I've reviewed the documents for claim ${id}. This ${type.toLowerCase()} claim for $${amount.toLocaleString()} appears to have consistent documentation across the filed form and adjuster report.`,
      citations: [
        { file: `${id}_claim_form.pdf`, page: 1 },
        { file: `${id}_adjuster_report.pdf`, page: 3 },
      ],
      timestamp: '2026-11-16T08:30:00Z',
    },
    {
      id: `${id}-m2`,
      role: 'user',
      text: 'What are the key findings from the damage assessment?',
      timestamp: '2026-11-16T08:31:00Z',
    },
    {
      id: `${id}-m3`,
      role: 'assistant',
      text: `The adjuster report documents damage consistent with the claimed amount of $${amount.toLocaleString()}. Photographic evidence on page 2 corroborates the reported loss extent. The policy coverage limit of $${(amount * 1.5).toLocaleString()} fully covers this claim.`,
      citations: [
        { file: `${id}_adjuster_report.pdf`, page: 2 },
        { file: `${id}_photos_1.png`, page: 1 },
        { file: `${id}_policy_schedule.pdf`, page: 4 },
      ],
      timestamp: '2026-11-16T08:31:30Z',
    },
  ];
  return base;
};

const CLAIMS: Claim[] = [
  {
    id: 'CLM-2026-001',
    claimant: 'Sarah Mitchell',
    type: 'Auto',
    stage: 'Submitted',
    status: 'open',
    amount: 8450,
    filedDate: '2026-11-12',
    closedDate: null,
    description: 'Rear-end collision at intersection. Vehicle sustained bumper and trunk damage.',
    adjuster: 'James Park',
    documents: documentsFor('CLM-2026-001', 4),
    timeline: timelineFor('Submitted', '2026-11-12', null),
    chat: chatFor('CLM-2026-001', 'Auto', 8450),
  },
  {
    id: 'CLM-2026-002',
    claimant: 'David Chen',
    type: 'Property',
    stage: 'Validated',
    status: 'open',
    amount: 23400,
    filedDate: '2026-11-08',
    closedDate: null,
    description: 'Water damage from burst pipe in basement. Affected drywall and flooring.',
    adjuster: 'Maria Lopez',
    documents: documentsFor('CLM-2026-002', 4),
    timeline: timelineFor('Validated', '2026-11-08', null),
    chat: chatFor('CLM-2026-002', 'Property', 23400),
  },
  {
    id: 'CLM-2026-003',
    claimant: 'Emily Watson',
    type: 'Health',
    stage: 'Extracted',
    status: 'open',
    amount: 4200,
    filedDate: '2026-11-05',
    closedDate: null,
    description: 'Emergency room visit for acute appendicitis. Surgery and 2-day stay.',
    adjuster: 'James Park',
    documents: documentsFor('CLM-2026-003', 3),
    timeline: timelineFor('Extracted', '2026-11-05', null),
    chat: chatFor('CLM-2026-003', 'Health', 4200),
  },
  {
    id: 'CLM-2026-004',
    claimant: 'Robert Johnson',
    type: 'Liability',
    stage: 'Under Review',
    status: 'open',
    amount: 56000,
    filedDate: '2026-10-28',
    closedDate: null,
    description: 'Slip-and-fall at commercial premises. Claimant seeking medical + lost wages.',
    adjuster: 'Maria Lopez',
    documents: documentsFor('CLM-2026-004', 4),
    timeline: timelineFor('Under Review', '2026-10-28', null),
    chat: chatFor('CLM-2026-004', 'Liability', 56000),
  },
  {
    id: 'CLM-2026-005',
    claimant: 'Jessica Brown',
    type: 'Auto',
    stage: 'Approved/Rejected',
    status: 'open',
    amount: 12750,
    filedDate: '2026-10-20',
    closedDate: null,
    description: 'Hail damage to vehicle. Multiple dents across hood and roof.',
    adjuster: 'Tom Reeves',
    documents: documentsFor('CLM-2026-005', 4),
    timeline: timelineFor('Approved/Rejected', '2026-10-20', null),
    chat: chatFor('CLM-2026-005', 'Auto', 12750),
  },
  {
    id: 'CLM-2026-006',
    claimant: 'Michael O\'Brien',
    type: 'Property',
    stage: 'Paid',
    status: 'closed',
    amount: 9800,
    filedDate: '2026-10-10',
    closedDate: '2026-10-30',
    description: 'Theft of personal electronics from residence. Police report filed.',
    adjuster: 'Tom Reeves',
    documents: documentsFor('CLM-2026-006', 3),
    timeline: timelineFor('Paid', '2026-10-10', '2026-10-30'),
    chat: chatFor('CLM-2026-006', 'Property', 9800),
  },
  {
    id: 'CLM-2026-007',
    claimant: 'Linda Garcia',
    type: 'Travel',
    stage: 'Submitted',
    status: 'open',
    amount: 3200,
    filedDate: '2026-11-14',
    closedDate: null,
    description: 'Trip cancellation due to medical emergency. Non-refundable flights and hotel.',
    adjuster: 'James Park',
    documents: documentsFor('CLM-2026-007', 3),
    timeline: timelineFor('Submitted', '2026-11-14', null),
    chat: chatFor('CLM-2026-007', 'Travel', 3200),
  },
  {
    id: 'CLM-2026-008',
    claimant: 'Kevin Zhang',
    type: 'Workers Comp',
    stage: 'Validated',
    status: 'open',
    amount: 18700,
    filedDate: '2026-11-06',
    closedDate: null,
    description: 'Workplace back injury during lifting. Ongoing physical therapy required.',
    adjuster: 'Maria Lopez',
    documents: documentsFor('CLM-2026-008', 4),
    timeline: timelineFor('Validated', '2026-11-06', null),
    chat: chatFor('CLM-2026-008', 'Workers Comp', 18700),
  },
  {
    id: 'CLM-2026-009',
    claimant: 'Patricia Lee',
    type: 'Auto',
    stage: 'Extracted',
    status: 'open',
    amount: 6100,
    filedDate: '2026-11-03',
    closedDate: null,
    description: 'Windshield and side mirror damage from road debris on highway.',
    adjuster: 'Tom Reeves',
    documents: documentsFor('CLM-2026-009', 3),
    timeline: timelineFor('Extracted', '2026-11-03', null),
    chat: chatFor('CLM-2026-009', 'Auto', 6100),
  },
  {
    id: 'CLM-2026-010',
    claimant: 'Daniel Rivera',
    type: 'Health',
    stage: 'Under Review',
    status: 'open',
    amount: 15400,
    filedDate: '2026-10-25',
    closedDate: null,
    description: 'Physical therapy course following knee surgery. 12 sessions claimed.',
    adjuster: 'James Park',
    documents: documentsFor('CLM-2026-010', 4),
    timeline: timelineFor('Under Review', '2026-10-25', null),
    chat: chatFor('CLM-2026-010', 'Health', 15400),
  },
  {
    id: 'CLM-2026-011',
    claimant: 'Aisha Patel',
    type: 'Property',
    stage: 'Approved/Rejected',
    status: 'open',
    amount: 31200,
    filedDate: '2026-10-18',
    closedDate: null,
    description: 'Fire damage to kitchen. Smoke damage throughout ground floor.',
    adjuster: 'Maria Lopez',
    documents: documentsFor('CLM-2026-011', 4),
    timeline: timelineFor('Approved/Rejected', '2026-10-18', null),
    chat: chatFor('CLM-2026-011', 'Property', 31200),
  },
  {
    id: 'CLM-2026-012',
    claimant: 'Christopher Hall',
    type: 'Liability',
    stage: 'Paid',
    status: 'closed',
    amount: 7200,
    filedDate: '2026-10-05',
    closedDate: '2026-10-22',
    description: 'Minor fender bender in parking lot. Third-party vehicle damage.',
    adjuster: 'Tom Reeves',
    documents: documentsFor('CLM-2026-012', 3),
    timeline: timelineFor('Paid', '2026-10-05', '2026-10-22'),
    chat: chatFor('CLM-2026-012', 'Liability', 7200),
  },
];

/* ------------------------------------------------------------------ */
/*  API — swap function bodies to hit a real backend later.            */
/*  Each returns a Promise to match an async HTTP client's shape.      */
/* ------------------------------------------------------------------ */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(email: string, _password: string): Promise<{ email: string }> {
  await delay(400);
  if (!email.includes('@')) throw new Error('Enter a valid email address.');
  return { email };
}

export async function fetchClaims(): Promise<Claim[]> {
  await delay(300);
  return CLAIMS;
}

export async function fetchClaim(id: string): Promise<Claim | null> {
  await delay(250);
  return CLAIMS.find((c) => c.id === id) ?? null;
}

export async function fetchKpis(): Promise<Kpis> {
  await delay(300);
  const total = CLAIMS.length;
  const pending = CLAIMS.filter(
    (c) => c.stage === 'Under Review' || c.stage === 'Approved/Rejected',
  ).length;
  const approved = CLAIMS.filter(
    (c) => c.stage === 'Paid' || c.stage === 'Approved/Rejected',
  ).reduce((sum, c) => sum + c.amount, 0);
  const closed = CLAIMS.filter((c) => c.closedDate);
  const avgDays =
    closed.length > 0
      ? Math.round(
          closed.reduce((s, c) => {
            const d1 = new Date(c.filedDate).getTime();
            const d2 = new Date(c.closedDate!).getTime();
            return s + (d2 - d1) / (1000 * 60 * 60 * 24);
          }, 0) / closed.length,
        )
      : 0;
  return { totalClaims: total, pendingReview: pending, approvedAmount: approved, avgDaysToClose: avgDays };
}

export async function fetchClaimsByStage(): Promise<StageCount[]> {
  await delay(300);
  return STAGES.map((stage) => ({
    stage,
    count: CLAIMS.filter((c) => c.stage === stage).length,
  }));
}

export async function fetchClaimsByType(): Promise<TypeCount[]> {
  await delay(300);
  const map = new Map<string, number>();
  CLAIMS.forEach((c) => map.set(c.type, (map.get(c.type) ?? 0) + 1));
  return Array.from(map.entries()).map(([type, count]) => ({ type: type as TypeCount['type'], count }));
}

export async function fetchClaimsPerMonth(): Promise<MonthCount[]> {
  await delay(300);
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const counts = [3, 5, 4, 7, 8, 12];
  return months.map((m, i) => ({ month: m, count: counts[i] }));
}

export async function advanceStage(id: string, toStage: Stage): Promise<Claim | null> {
  await delay(400);
  const claim = CLAIMS.find((c) => c.id === id);
  if (!claim) return null;
  claim.stage = toStage;
  claim.timeline = timelineFor(toStage, claim.filedDate, claim.closedDate);
  if (toStage === 'Paid') {
    claim.status = 'closed';
    claim.closedDate = new Date().toISOString().slice(0, 10);
  }
  return claim;
}

export async function recommendNextStage(id: string): Promise<{ nextStage: Stage; rationale: string }> {
  await delay(600);
  const claim = CLAIMS.find((c) => c.id === id);
  if (!claim) throw new Error('Claim not found');
  const idx = STAGES.indexOf(claim.stage);
  const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
  return {
    nextStage: next,
    rationale: `Based on document completeness and policy coverage verification, claim ${id} is ready to advance to ${next}. All required documents for the current stage have been received and reviewed.`,
  };
}

export async function sendChatMessage(
  claimId: string,
  text: string,
): Promise<ChatMessage> {
  await delay(700);
  const claim = CLAIMS.find((c) => c.id === claimId);
  const docs = claim?.documents ?? [];
  const reply: ChatMessage = {
    id: `${claimId}-m-${Date.now()}`,
    role: 'assistant',
    text: `Regarding "${text.slice(0, 60)}": I cross-referenced the available documents for claim ${claimId}. The claim file and adjuster report align on the reported damages and amount. Policy coverage limits are sufficient for the claimed amount.`,
    citations: [
      { file: docs[0]?.name ?? `${claimId}_claim_form.pdf`, page: 1 },
      { file: docs[3]?.name ?? `${claimId}_adjuster_report.pdf`, page: 2 },
    ],
    timestamp: new Date().toISOString(),
  };
  return reply;
}
