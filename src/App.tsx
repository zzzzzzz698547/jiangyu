import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { trackCtaClick, trackLineClick, trackPhoneClick } from './lib/analytics';
import { submitLead, type LeadFormValues } from './lib/leadSubmit';

type Tone = 'light' | 'dark';
type IconProps = { className?: string };
type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  desc: string;
  tone?: Tone;
  align?: 'left' | 'center';
};
type RevealProps = { children: ReactNode; className?: string; delay?: number };
type TrustItem = { title: string; desc: string; icon: (props: IconProps) => JSX.Element };
type ServiceItem = { title: string; desc: string; icon: (props: IconProps) => JSX.Element };
type ProcessItem = { step: string; title: string; desc: string; icon: (props: IconProps) => JSX.Element };
type NeedItem = { title: string; desc: string; icon: (props: IconProps) => JSX.Element };
type MatchItem = { title: string; desc: string; icon: (props: IconProps) => JSX.Element; badge: string };
type ServiceDetail = {
  anchorId: string;
  path: string;
  title: string;
  subtitle: string;
  tag: string;
  desc: string;
  who: string;
  tips: string[];
  note: string;
  icon: (props: IconProps) => JSX.Element;
};
type ServicePageConfig = {
  bannerTheme: {
    from: string;
    via: string;
    to: string;
    accent: string;
    glow: string;
  };
  faq: FaqItem[];
  ctaTitle: string;
  ctaDesc: string;
};
type ArticleItem = {
  tag: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  detailId: string;
  bullets: string[];
};
type ImageCard = {
  title: string;
  desc: string;
  image: string;
  detailTarget?: string;
  theme?: string;
};
type CalculatorMode = 'noGrace' | 'withGrace';
type Testimonial = {
  title: string;
  profile: string;
  intro: string;
  details: string[];
  cta: string;
};
type FaqItem = { q: string; a: string };

const brand = {
  name: '將御線上理財平臺',
  subName: 'JIANG YU FINANCE',
  phone: '0918-222-236',
  telHref: 'tel:0918222236',
  lineHref: 'https://line.me/ti/p/@888hirrf',
};

const serviceCardThemeRegistry = new Map<string, string>();

const withTheme = <T extends ImageCard>(cards: T[], theme: string): T[] =>
  cards.map((card) => {
    serviceCardThemeRegistry.set(`${card.title}|${card.desc}`, theme);
    return { ...card, theme };
  });

const aiServiceUrl =
  (import.meta.env.VITE_AI_SERVICE_URL as string | undefined)?.trim() ||
  'about:blank';

const formInitialState: LeadFormValues = {
  name: '',
  phone: '',
  lineId: '',
  amount: '',
  occupation: '',
  notes: '',
};

const trustItems: TrustItem[] = [
  { title: '專人一對一評估', desc: '先了解你的用途與條件，再提供適合方向。', icon: ShieldIcon },
  { title: '多元方案媒合', desc: '依資金需求與狀況，協助整理不同方向。', icon: LayersIcon },
  { title: '資料保密處理', desc: '資料只用於聯繫與評估，流程清楚安心。', icon: LockIcon },
  { title: '流程透明清楚', desc: '所需資料與下一步會說明清楚，降低不確定感。', icon: FlowIcon },
];

const needs: NeedItem[] = [
  { title: '短期資金需求', desc: '臨時週轉、快速補足現金流。', icon: ClockIcon },
  { title: '每月壓力整合', desc: '希望整理負擔，讓支出更好管理。', icon: StackIcon },
  { title: '創業資金週轉', desc: '啟動營運、採購或計畫初期支援。', icon: BriefcaseIcon },
  { title: '臨時資金安排', desc: '遇到突發情況，先快速評估方向。', icon: SparkIcon },
];

const services: ServiceItem[] = [
  { title: '信用貸款', desc: '適合短期週轉、單純資金需求。', icon: CreditIcon },
  { title: '整合負債', desc: '把多筆負擔整理成更容易管理的方向。', icon: StackIcon },
  { title: '房屋貸款', desc: '已有房產者可先了解額外運用空間。', icon: HomeIcon },
  { title: '汽車貸款', desc: '以汽車作為評估依據，適合名下有車、需要活化資金的人。', icon: CarIcon },
  { title: '機車貸款', desc: '以機車作為資金規劃方向，適合小額週轉或短期需求。', icon: MotorcycleIcon },
  { title: '債務協商', desc: '先幫你看條件，再評估可行方向。', icon: BuildingIcon },
  { title: '企業貸款', desc: '營運採購、短期周轉、資金銜接都可談。', icon: BuildingIcon },
  { title: '商品貸款', desc: '採購貨品、設備或專案支出可先評估。', icon: ShoppingCartIcon },
  { title: '手機貸款', desc: '小額靈活安排，適合短期資金需求。', icon: PhoneIcon },
];

const serviceDetails: ServiceDetail[] = [
  {
    anchorId: 'service-credit-loan',
    path: '/services/credit-loan',
    title: '信用貸款',
    subtitle: 'credit loan',
    tag: '最常見',
    desc: '以個人信用與收入狀況作為主要評估基礎，適合有臨時資金需求、但不想動用擔保品的人。',
    who: '適合上班族、自營者、剛需要週轉的人先了解。',
    tips: ['重點看收入穩定度與工作年資', '可先試算月付壓力，再決定是否申請', '先比較利率、手續費與總成本'],
    note: '科普：信用貸款不是只看利率，實際還要一起看手續費、期數與總還款金額。',
    icon: CreditIcon,
  },
  {
    anchorId: 'service-debt-consolidation',
    path: '/services/debt-consolidation',
    title: '整合負債',
    subtitle: 'debt consolidation',
    tag: '壓力整理',
    desc: '把多筆帳款或貸款整理成較單純的月付結構，讓每月支出更容易管理。',
    who: '適合手上有多筆分期、卡費或小額貸款的人先盤整。',
    tips: ['先列出所有月付與剩餘期數', '確認整合後是否真的降低壓力', '不要只看單一利率，要看整體月付'],
    note: '科普：整合負債的重點是「重新排列現金流」，不只是把債務換個名字。',
    icon: StackIcon,
  },
  {
    anchorId: 'service-mortgage',
    path: '/services/mortgage',
    title: '房屋貸款',
    subtitle: 'mortgage',
    tag: '不動產',
    desc: '以房屋作為主要評估標的，適合已有房產、想做較大額資金規劃的人。',
    who: '適合有房產、需要較高額度或想運用資產的人先諮詢。',
    tips: ['先看估值與可貸成數', '確認是否有額外費用與設定成本', '了解原貸與增貸的差異'],
    note: '科普：房屋類方案通常重視估值、成數與文件完整度，時程也可能比一般信用貸款多一些。',
    icon: HomeIcon,
  },
  {
    anchorId: 'service-car-loan',
    path: '/services/car-loan',
    title: '汽車貸款',
    subtitle: 'car loan',
    tag: '交通資產',
    desc: '適合買車找錢、原車融資或想活化汽車資產的人先了解。',
    who: '適合名下有汽車、想用車輛規劃資金的人了解。',
    tips: ['先確認車況、車齡與車籍資料', '不同車種與車況會影響條件', '可先評估是否需要保留使用權'],
    note: '科普：汽車貸款通常會受車齡、車種、持有狀況影響，條件差異很大。買車找錢時，更要看清楚原車融資、汽車增貸與汽車轉增貸的差別。',
    icon: CarIcon,
  },
  {
    anchorId: 'service-scooter-loan',
    path: '/services/scooter-loan',
    title: '機車貸款',
    subtitle: 'scooter loan',
    tag: '機動資產',
    desc: '以機車作為資金規劃的一種方式，適合有名下機車、想用小資產做規劃的人。',
    who: '適合有機車、需要小額週轉或短期資金的人。',
    tips: ['先確認車齡與權屬資料', '不同車況會影響條件與可行性', '可先了解是否需要保留使用權'],
    note: '科普：機車貸通常比汽車方案更偏小額與快速評估，但條件仍會看車況與資料。',
    icon: MotorcycleIcon,
  },
  {
    anchorId: 'service-debt-negotiation',
    path: '/services/debt-negotiation',
    title: '債務協商',
    subtitle: 'debt negotiation',
    tag: '先溝通',
    desc: '針對還款壓力較大、希望重新協調條件的人，先看可行方向與後續安排。',
    who: '適合正在承受較大壓力、想先理解流程的人。',
    tips: ['先誠實整理目前負債現況', '協商目標是降低壓力與提升可管理性', '流程與影響需先充分了解'],
    note: '科普：協商是重新談還款方式，重點在於讓未來的還款變得可持續。',
    icon: BuildingIcon,
  },
  {
    anchorId: 'service-business-loan',
    path: '/services/business-loan',
    title: '企業貸款',
    subtitle: 'business loan',
    tag: '營運資金',
    desc: '以公司營運、採購、周轉、專案支出為主的資金規劃方式，適合有商業需求者。',
    who: '適合老闆、創業者、工作室與營運中的公司。',
    tips: ['重點看營業狀況與用途說明', '常見要提供營收或財務資料', '用途越清楚，越容易評估'],
    note: '科普：企業類方案常會比個人貸款更重視用途與公司營運狀況。',
    icon: BuildingIcon,
  },
  {
    anchorId: 'service-product-loan',
    path: '/services/product-loan',
    title: '商品貸款',
    subtitle: 'product loan',
    tag: '指定用途',
    desc: '以特定商品或採購需求為出發點，常用於設備、貨品、合約服務等資金安排。',
    who: '適合有採購規劃、想先把貨款或商品成本處理好的人。',
    tips: ['先明確列出商品用途與金額', '不同商品與交易方式會影響條件', '確認是否屬於分期或專案型規劃'],
    note: '科普：商品貸款看的是用途明確度與付款規劃，和一般現金週轉略有不同。',
    icon: ShoppingCartIcon,
  },
  {
    anchorId: 'service-mobile-loan',
    path: '/services/mobile-loan',
    title: '手機貸款',
    subtitle: 'mobile loan',
    tag: '小額靈活',
    desc: '通常用於較小額、短週期的資金安排，適合有短期需求且想快速評估的人。',
    who: '適合臨時有小額資金需求、希望先快速了解的人。',
    tips: ['先確認金額是否真的只需要小額', '重點看總成本而不是只看月付', '資料越簡單，評估越快'],
    note: '科普：手機貸款多半屬於小額短期的概念，最重要的是清楚還款節奏。',
    icon: PhoneIcon,
  },
];

const matchItems: MatchItem[] = [
  { badge: 'AI 篩選', title: '快速比對', desc: '先依你的條件整理可行方向。', icon: ChartIcon },
  { badge: '真人協助', title: '專人說明', desc: '把流程、文件與注意事項講清楚。', icon: MessageIcon },
  { badge: '多家比較', title: '方案媒合', desc: '協助比對不同方案的差異。', icon: LayersIcon },
  { badge: '免費諮詢', title: '先聊方向', desc: '可先了解再決定要不要往下。', icon: SparkIcon },
  { badge: '費用透明', title: '資訊清楚', desc: '先說明條件、費用與流程。', icon: FlowIcon },
  { badge: '安全保密', title: '資料保護', desc: '個資只用於聯繫與評估。', icon: LockIcon },
];

const articles: ArticleItem[] = [
  {
    tag: '債務整理',
    title: '先看自己的壓力結構，再決定要不要整合負擔',
    date: '2026-04-19',
    excerpt: '把每月支出、現有貸款與現金流先整理出來，會更容易判斷適合哪一種方向。',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    detailId: 'report-1',
    bullets: ['先盤點每月固定支出', '整理目前利率與剩餘期數', '再評估是否適合整合'],
  },
  {
    tag: '房屋貸款',
    title: '房屋相關資金安排，重點不是快，而是條件要看懂',
    date: '2026-04-18',
    excerpt: '申請前先了解估值、成數與手續流程，避免只看表面利率而忽略整體成本。',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    detailId: 'report-2',
    bullets: ['先看估值與可貸成數', '確認手續費與額外成本', '了解流程時程與文件'],
  },
  {
    tag: '信用貸款',
    title: '信用貸款怎麼看？先了解評估重點，會更安心',
    date: '2026-04-17',
    excerpt: '不同職業與收入結構會影響可行方案，先了解規則，再決定是否要進一步詢問。',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    detailId: 'report-3',
    bullets: ['職業與收入會影響評估', '先看條件再決定是否申請', '避免一次送太多件影響判斷'],
  },
];

const creditLoanImageCards: ImageCard[] = withTheme([
  {
    title: '薪轉存褶月光',
    desc: '先整理每月收入、固定扣款與生活支出。',
    image: 'https://images.pexels.com/photos/8296984/pexels-photo-8296984.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#credit-report',
  },
  {
    title: '卡費只繳最低應繳',
    desc: '把卡費、分期與循環先列出來再看。',
    image: 'https://images.pexels.com/photos/10020090/pexels-photo-10020090.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#credit-report',
  },
  {
    title: '銀行往來先看白紙',
    desc: '讓條件與文件先整理乾淨，判斷更清楚。',
    image: 'https://images.pexels.com/photos/34862432/pexels-photo-34862432.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#credit-report',
  },
  {
    title: '想貸最高額度',
    desc: '先看收入、職業與負債比是否平衡。',
    image: 'https://images.pexels.com/photos/34975657/pexels-photo-34975657.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#credit-report',
  },
  {
    title: '近期已貸款',
    desc: '已動用額度時，要先看整體還款壓力。',
    image: 'https://images.pexels.com/photos/35028998/pexels-photo-35028998.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#credit-report',
  },
  {
    title: '想整合負債',
    desc: '把多筆帳款與月付先整理，方向更明確。',
    image: 'https://images.pexels.com/photos/8292883/pexels-photo-8292883.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#credit-report',
  },
], '信用');

const creditLoanFactors = [
  { label: '月薪22倍', desc: '常見概念，但仍要看完整條件。' },
  { label: '負債比率', desc: '先看每月壓力與總負擔。' },
  { label: '聯徵次數', desc: '申請與查詢次數都可能影響判斷。' },
  { label: '信用評分', desc: '平時繳款習慣會反映在紀錄上。' },
  { label: '信用空白', desc: '沒有往來紀錄也不一定代表不好。' },
  { label: '動用卡循', desc: '循環使用狀況是重要觀察點。' },
  { label: '收入證明', desc: '薪轉、扣繳或報稅資料都可能用到。' },
  { label: '現職年資', desc: '工作穩定度常會被一起評估。' },
];

const debtConsolidationImageCards: ImageCard[] = withTheme([
  {
    title: '薪水全都繳帳單',
    desc: '每月收入一進來就先被帳單吃掉，壓力會越積越大。',
    image: 'https://images.pexels.com/photos/4174471/pexels-photo-4174471.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-report',
  },
  {
    title: '背負多筆債務',
    desc: '卡費、信貸、分期都各自繳，容易忘記也難掌握。',
    image: 'https://images.pexels.com/photos/3782227/pexels-photo-3782227.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-report',
  },
  {
    title: '多筆繳款日',
    desc: '不同帳單分散在不同日子，容易造成管理混亂。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-report',
  },
  {
    title: '動用卡循',
    desc: '長期循環使用時，利息與壓力會持續放大。',
    image: 'https://images.pexels.com/photos/4174305/pexels-photo-4174305.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-report',
  },
  {
    title: '預借現金繳貸款',
    desc: '短期補洞可以暫時應付，但長期會更難整理。',
    image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-report',
  },
  {
    title: '無力負擔月付金',
    desc: '當月付已經接近臨界點，就該先看整體結構。',
    image: 'https://images.pexels.com/photos/3943774/pexels-photo-3943774.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-report',
  },
], '理債');

const debtConsolidationFactors = [
  { label: '一筆負債一條線', desc: '先把分散的月付整理成可讀懂的結構。' },
  { label: '免繳信用卡高額循環', desc: '先降低壓力，再看後續怎麼安排。' },
  { label: '約可降低月付壓力', desc: '是否真的下降，仍要看原始條件與新方案。' },
  { label: '提升每月可支配額', desc: '把還款整理好，生活壓力才比較有空間。' },
  { label: '繳款年限可重排', desc: '年限調整會影響月付與總成本。' },
  { label: '統一繳款日', desc: '減少忘記繳款與多頭管理的混亂。' },
  { label: '不會影響信用分數？', desc: '實際還是要看流程與後續紀錄，先了解比較安心。' },
  { label: '穩定繳款更重要', desc: '整合只是方法，後續穩定還款才是重點。' },
];

const debtNegotiationImageCards: ImageCard[] = withTheme([
  {
    title: '協商銀行不友善',
    desc: '先前申請遇到卡關，也能先看退件原因。',
    image: 'https://images.pexels.com/photos/3782227/pexels-photo-3782227.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-negotiation-report',
  },
  {
    title: '協商核准但利率偏高',
    desc: '已核准但月付太重，想再整理條件。',
    image: 'https://images.pexels.com/photos/4174471/pexels-photo-4174471.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-negotiation-report',
  },
  {
    title: '協商還款期間有貸款需求',
    desc: '還在繳款中，但臨時還是需要資金。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-negotiation-report',
  },
  {
    title: '擔憂信用註記伴隨一生',
    desc: '很多人擔心註記影響太久，想先了解。',
    image: 'https://images.pexels.com/photos/8292883/pexels-photo-8292883.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-negotiation-report',
  },
  {
    title: '貸款滿額但財務未解決',
    desc: '月付壓力仍高，卻不知道怎麼調整。',
    image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-negotiation-report',
  },
  {
    title: '理債缺乏整體性規劃',
    desc: '帳單很多時，更需要先做全盤整理。',
    image: 'https://images.pexels.com/photos/4174305/pexels-photo-4174305.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#debt-negotiation-report',
  },
], '理債');

const debtNegotiationTypes = [
  {
    title: '前置協商',
    desc: '債務人向最大債權銀行提出申請，由債權銀行統整債權，協助調整利率與還款期數。',
  },
  {
    title: '個別協商',
    desc: '針對單一債權銀行或特定債務，依個別狀況提出調整方案。',
  },
  {
    title: '二次協商',
    desc: '若前案已難再正常繳款，可能需要重新進入更進一步的協商程序。',
  },
];

const debtNegotiationNotes = [
  '如果具備還款能力，銀行不一定會接受債務協商，建議先辦整合負債。',
  '提出申請後若進入信用註記，期間內再申請信用卡或信用貸款會受到限制。',
  '若已有工作收入，協商方案通常會比完全無收入狀況更有機會。',
  '名下若有資產太少，銀行可能認為沒有足夠償還能力，也可能不易核准。',
  '近期新增貸款且已持續繳款半年以上，仍需看整體風險與銀行判斷。',
  '曾任企業主或平均月營收較高者，仍要依整體債務與收入狀況評估。',
];

const mortgageImageCards: ImageCard[] = withTheme([
  {
    title: '屋齡過高',
    desc: '房屋條件較特殊時，先看是否還有可行方向。',
    image: 'https://images.pexels.com/photos/29873036/pexels-photo-29873036.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mortgage-report',
  },
  {
    title: '借款人 / 所有權人年紀太大',
    desc: '年齡、權屬與文件是常見評估重點。',
    image: 'https://images.pexels.com/photos/29873019/pexels-photo-29873019.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mortgage-report',
  },
  {
    title: '找不到符合期待的方案',
    desc: '先比較增貸、二胎與一胎方向，再做判斷。',
    image: 'https://images.pexels.com/photos/29873023/pexels-photo-29873023.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mortgage-report',
  },
  {
    title: '近期增貸',
    desc: '有額外資金需求，但希望先知道成本。',
    image: 'https://images.pexels.com/photos/29873036/pexels-photo-29873036.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mortgage-report',
  },
  {
    title: '沒財力、待業中',
    desc: '收入結構較特殊，也能先做初步評估。',
    image: 'https://images.pexels.com/photos/29873019/pexels-photo-29873019.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mortgage-report',
  },
  {
    title: '貸款月付金過重',
    desc: '月付壓力偏高時，先看能不能重整結構。',
    image: 'https://images.pexels.com/photos/29873023/pexels-photo-29873023.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mortgage-report',
  },
], '房屋');

const mortgageWays = [
  {
    title: '一胎房貸',
    desc: '在房屋本身沒有任何貸款或抵押情況下，向第一家銀行申請的貸款方式。',
  },
  {
    title: '房屋增貸',
    desc: '房貸已繳一段時間後，依房屋殘值與還款情況向原銀行再申請資金。',
  },
  {
    title: '二胎房貸',
    desc: '房屋已有第一順位抵押，另外再向其他金融單位做第二順位資金規劃。',
  },
];

const mortgageFactors = [
  { label: '年齡', desc: '年滿 20 歲到 65 歲常見，但仍以實際條件為準。' },
  { label: '屋主', desc: '通常以申請人是否為屋主、或具備相關權利為主。' },
  { label: '殘值', desc: '房屋可運用空間與剩餘價值，是重要評估核心。' },
  { label: '正常繳款', desc: '原有房貸是否穩定繳款，會影響後續判斷。' },
  { label: '信用評分', desc: '聯徵與信用使用習慣會影響申請方向。' },
  { label: '用途', desc: '資金用途越清楚，越容易整理出適合方案。' },
];

const mortgageComparisonRows = [
  ['額度', '通常利率最低，核貸額度最高為房屋殘值的 80%，一般不超過 300 萬', '通常利率較高，核貸額度最高為 300 萬'],
  ['限制', '對信用要求較高，有私人設定不核貸', '審核較寬鬆，有私人設定需視狀況'],
  ['利率', '約 3%～6% 視申貸人授信條件', '約 5%～16% 視申貸人授信條件'],
  ['還款期限', '增貸最長可達 30 年，二胎最長 7～15 年', '最長 7～10 年'],
];

const carLoanImageCards: ImageCard[] = withTheme([
  {
    title: '無正式財力',
    desc: '職業收入證明不齊，也能先看條件。',
    image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#car-report',
  },
  {
    title: '聯徵負債比過高',
    desc: '月付壓力偏高時，先看車輛是否可活化。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#car-report',
  },
  {
    title: '協商繳款中',
    desc: '若正處於協商狀態，也可先評估方案。',
    image: 'https://images.pexels.com/photos/3782227/pexels-photo-3782227.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#car-report',
  },
  {
    title: '信用評分不佳',
    desc: '有逾期紀錄時，先把整體情況看清楚。',
    image: 'https://images.pexels.com/photos/8292883/pexels-photo-8292883.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#car-report',
  },
  {
    title: '車齡老，無殘值',
    desc: '車輛條件較老，也可先看是否還有方向。',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#car-report',
  },
  {
    title: '欠稅罰單高',
    desc: '撥款前無法一次清償，也要先看是否可行。',
    image: 'https://images.pexels.com/photos/29873036/pexels-photo-29873036.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#car-report',
  },
], '汽車');

const carLoanWays = [
  {
    title: '原車融資',
    desc: '用已經貸款完畢的汽車，來申請一筆資金。',
  },
  {
    title: '汽車增貸',
    desc: '車子本身已有貸款，依照原貸款與殘值再申請資金。',
  },
  {
    title: '汽車轉增貸',
    desc: '把原本的汽車貸款轉移到新的貸款機構，並加上資金額度。',
  },
];

const carLoanBenefits = [
  { label: '最高核貸車價 80~130%', desc: '實際依車況與方案而定。' },
  { label: '無車齡限制', desc: '不同方案對車齡限制不同。' },
  { label: '可不調聯徵紀錄', desc: '實際仍需看案件評估。' },
  { label: '最快 24hr 取得資金', desc: '流程完整度會影響速度。' },
  { label: '期數最長 5~7 年', desc: '還款期數可依方案調整。' },
  { label: '無現職年齡限制', desc: '重點在整體條件與文件。' },
  { label: '無正式財力證明也可辦理', desc: '收入形式多元也可先評估。' },
];

const businessLoanImageCards: ImageCard[] = withTheme([
  {
    title: '檢附資料繁雜',
    desc: '公司文件很多，申辦時效不佳。',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#business-report',
  },
  {
    title: '報稅致存摺不佳',
    desc: '資料一看就複雜，過件率也不高。',
    image: 'https://images.pexels.com/photos/7688360/pexels-photo-7688360.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#business-report',
  },
  {
    title: '沒有往來的銀行',
    desc: '需要不動產擔保或其他替代方式。',
    image: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#business-report',
  },
  {
    title: '無標準 SOP',
    desc: '企業資料零散，難以直接送件。',
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#business-report',
  },
  {
    title: '初次往來的銀行',
    desc: '放款額度偏低，需先建立資料印象。',
    image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#business-report',
  },
  {
    title: '資本額不足',
    desc: '想要更大資金，卻卡在基本條件。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#business-report',
  },
], '企業');

const businessLoanOverview = [
  {
    title: '創新研發補助計畫 SBIR',
    desc: ['最高 3000 萬元，不佔股，不用還款', '員工人數 200 人內，新成立公司亦可'],
  },
  {
    title: '中小企業千億振興專案',
    desc: ['企業未滿 5 年，資本額 500 萬元以下', '總額度 6000 億元'],
  },
  {
    title: '低碳智慧節約管貸款',
    desc: ['補貼利率 1.72%', '一年可借最高 3,500 萬元', '信保基金最高 9 成擔保'],
  },
  {
    title: '疫後振興專案貸款',
    desc: ['任一個月營收低於平均營收 15%', '最高可貸 400 萬', '信保基金 9 成擔保'],
  },
  {
    title: '青年創業及啟動金貸款',
    desc: ['成立 8 個月內最高可貸 200 萬', '成立 8 個月以上最高可貸 400 萬', '5 年利息補貼', '信保基金最高 10 成擔保'],
  },
  {
    title: '中小企業貸款',
    desc: ['成立滿 1 年', '報稅營業收入符合 100 萬以上(含)', '信保基金最高 9 成擔保', '員工未滿 5 人、200 萬元以上專案'],
  },
];

const businessLoanNotes = [
  '各家銀行初往往會先以小額度做第一次往來，往來久了才會再爭取提高額度。',
  '若檢附文件準備不足，或不清楚核貸條件，可尋求貸款顧問的協助。',
  '中小企業除了營運資料外，也要整理好財報、報稅與上下游資料。',
  '若有政府補助或政策性貸款，也可以先看是否符合條件。',
];

const productLoanImageCards: ImageCard[] = withTheme([
  {
    title: '採購貨品壓力',
    desc: '備貨或叫貨成本高時，先看商品貸款能不能處理。',
    image: 'https://images.pexels.com/photos/5706001/pexels-photo-5706001.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#product-report',
  },
  {
    title: '設備汰換',
    desc: '機器、辦公設備或工具更新，都可先了解。',
    image: 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#product-report',
  },
  {
    title: '合約支出',
    desc: '特定專案或合約付款，也可先評估規劃。',
    image: 'https://images.pexels.com/photos/7735777/pexels-photo-7735777.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#product-report',
  },
  {
    title: '分期安排',
    desc: '想把一次性支出分攤，先看適合與否。',
    image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#product-report',
  },
  {
    title: '短期備貨',
    desc: '短週期補貨、搶單或檔期支出很常見。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#product-report',
  },
  {
    title: '資金卡住',
    desc: '商品貨款卡住時，可先確認哪種方案更合適。',
    image: 'https://images.pexels.com/photos/4174305/pexels-photo-4174305.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#product-report',
  },
], '商品');

const mobileLoanImageCards: ImageCard[] = withTheme([
  {
    title: '短期小額需求',
    desc: '臨時缺口、先補一筆小額資金。',
    image: 'https://images.pexels.com/photos/10149289/pexels-photo-10149289.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mobile-report',
  },
  {
    title: '急件要快',
    desc: '需要快速看方向的人，通常會先看這個方案。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mobile-report',
  },
  {
    title: '收入不穩定',
    desc: '現金流不固定，也可以先評估可行性。',
    image: 'https://images.pexels.com/photos/6694952/pexels-photo-6694952.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mobile-report',
  },
  {
    title: '帳單快到期',
    desc: '即將繳款時，先看能不能解決壓力。',
    image: 'https://images.pexels.com/photos/6694564/pexels-photo-6694564.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mobile-report',
  },
  {
    title: '零散支出',
    desc: '多筆小額支出累積，也可先整理。',
    image: 'https://images.pexels.com/photos/9577243/pexels-photo-9577243.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mobile-report',
  },
  {
    title: '先看條件',
    desc: '想知道自己適不適合，先從條件開始。',
    image: 'https://images.pexels.com/photos/34482029/pexels-photo-34482029.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#mobile-report',
  },
], '手機');

const scooterLoanImageCards: ImageCard[] = withTheme([
  {
    title: '機車資產活化',
    desc: '名下有機車，可先看是否能做資金規劃。',
    image: 'https://images.pexels.com/photos/3806283/pexels-photo-3806283.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#scooter-report',
  },
  {
    title: '小額週轉',
    desc: '短期缺口、小資金需求很常見。',
    image: 'https://images.pexels.com/photos/3782227/pexels-photo-3782227.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#scooter-report',
  },
  {
    title: '車況有差',
    desc: '車齡、車況與權屬會影響條件。',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#scooter-report',
  },
  {
    title: '通勤工具',
    desc: '還要日常使用，也能先了解保留使用方式。',
    image: 'https://images.pexels.com/photos/4259145/pexels-photo-4259145.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#scooter-report',
  },
  {
    title: '文件較少',
    desc: '資料不完整，也能先看可行方向。',
    image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#scooter-report',
  },
  {
    title: '先諮詢再決定',
    desc: '想知道適不適合，先從條件開始。',
    image: 'https://images.pexels.com/photos/3943748/pexels-photo-3943748.jpeg?auto=compress&cs=tinysrgb&w=1200',
    detailTarget: '#scooter-report',
  },
], '機車');

const productLoanUses = [
  { title: '採購備貨', desc: '補貨、叫貨、旺季備庫存時先看資金安排。' },
  { title: '設備更新', desc: '工作設備、工具或器材汰換前先評估。' },
  { title: '專案付款', desc: '合約、專案、服務款項可先整理用途。' },
];

const productLoanFactors = [
  { label: '用途是否明確', desc: '商品、數量、金額與付款方式越清楚，評估越快。' },
  { label: '成本總額', desc: '不要只看單一期數，連同手續費與總還款一起看。' },
  { label: '付款節奏', desc: '是一次性支出、分期安排還是短期週轉，方向不同。' },
  { label: '文件完整度', desc: '交易資料、報價或合約內容若完整，會更好說明。' },
];

const mobileLoanUses = [
  { title: '短期小額', desc: '臨時缺口先補起來，重點是快與簡單。' },
  { title: '急件安排', desc: '希望流程簡潔、先知道可不可行的人。' },
  { title: '現金流補位', desc: '每月支出卡住時，先看能否短期調整。' },
];

const mobileLoanFactors = [
  { label: '金額不要只看小不小', desc: '小額也要看總成本、月付與實際壓力。' },
  { label: '流程速度', desc: '適合先把資料整理齊，再由專人快速看方向。' },
  { label: '還款節奏', desc: '短期方案要特別注意時間壓力與後續安排。' },
  { label: '資料簡化', desc: '資訊越清楚，越容易快速給出評估結果。' },
];

const studentLoanUses = [
  { title: '學費支出', desc: '學期費、學雜費、證照班或訓練費用。' },
  { title: '生活費補助', desc: '住宿、交通、日常支出等短中期安排。' },
  { title: '進修過渡', desc: '剛畢業、轉職或準備進修時先看方向。' },
];

const studentLoanFactors = [
  { label: '用途清楚', desc: '先區分是學費、生活費或進修支出。' },
  { label: '未來還款', desc: '先想好畢業或工作後的還款安排。' },
  { label: '身分與學籍', desc: '在學、準畢業或進修階段都可先諮詢。' },
  { label: '是否需要保人', desc: '不同狀況會有差異，先問清楚較安心。' },
];

const scooterLoanUses = [
  { title: '小額週轉', desc: '短期缺口先補，適合先看可行條件。' },
  { title: '機車資產活化', desc: '名下有車可先了解是否有利用空間。' },
  { title: '通勤保留', desc: '還要日常騎乘，也可以先確認安排方式。' },
];

const scooterLoanFactors = [
  { label: '車齡', desc: '車齡不同，能談到的條件會有差。' },
  { label: '車況', desc: '車況與使用狀況會影響可行性。' },
  { label: '權屬資料', desc: '車籍與權屬資料清楚，評估會更快。' },
  { label: '是否保留使用', desc: '如果還要騎乘，方案安排也會不同。' },
];

const processSteps: ProcessItem[] = [
  { step: '01', title: '線上諮詢', desc: '先留下基本資料，或直接透過 LINE 開始了解。', icon: MessageIcon },
  { step: '02', title: '條件評估', desc: '由專人確認你的需求，整理出適合的方向。', icon: ChartIcon },
  { step: '03', title: '方案媒合', desc: '依條件搭配可能方向，讓選擇更明確。', icon: FlowIcon },
  { step: '04', title: '快速辦理', desc: '文件與流程說明清楚，協助你銜接下一步。', icon: CheckCircleIcon },
];

const testimonials: Testimonial[] = [
  {
    title: '感謝將御提供的協助，幫助我把壓力重新整理好',
    profile: '吳小姐｜行政助理',
    intro: '原本卡費、信貸與生活支出疊在一起，月付變得很亂，也不知道該先處理哪一筆。',
    details: [
      '在將御協助下，先把每月壓力與支出順序重新整理，方向清楚很多。',
      '整個過程沒有被急著推方案，而是先看條件，再決定哪一種方式比較適合。',
    ],
    cta: '閱讀將御見證',
  },
  {
    title: '感謝將御的耐心陪伴，讓我先看懂再決定',
    profile: '陳先生｜小型工作室負責人',
    intro: '遇到短期週轉需求時，最怕資訊不清楚、流程不透明，也不想在還沒搞懂前就往下做。',
    details: [
      '將御先把文件、流程與注意事項說清楚，讓我知道哪些能做、哪些要先避開。',
      '回覆速度穩定，評估方式也比較安心，整體節奏比自己亂找資料有效很多。',
    ],
    cta: '查看完整見證',
  },
];

const faqs: FaqItem[] = [
  { q: '沒有保人可以辦嗎？', a: '可以先諮詢，實際還是要依條件評估是否有適合的方向，不一定都需要保人。' },
  { q: '辦理需要多久？', a: '每個案件條件不同，通常先完成初步評估後，再說明接下來可能的時程。' },
  { q: '聯徵會不會有影響？', a: '實際情況會依申請內容與流程而定，建議先由專人確認適合的方式。' },
  { q: '可以先諮詢再決定嗎？', a: '可以，先了解再決定是這個頁面的設計重點，不會強迫辦理。' },
  { q: '資料會保密嗎？', a: '會，資料只會用於聯繫與方案評估，並以保密方式處理。' },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function splitCardTitle(title: string) {
  const clean = title.replace(/\s+/g, '');
  if (clean.length <= 7) return [clean, ''];
  const pivot = Math.max(4, Math.ceil(clean.length / 2));
  return [clean.slice(0, pivot), clean.slice(pivot)];
}

function cardKeyword(title: string) {
  if (title.includes('學生') || title.includes('學費') || title.includes('進修')) return '學業';
  if (title.includes('手機')) return '手機';
  if (title.includes('信用') || title.includes('卡費') || title.includes('卡循') || title.includes('卡債') || title.includes('信用卡')) return '信用';
  if (title.includes('房')) return '房屋';
  if (title.includes('汽車') || title.includes('車')) return '汽車';
  if (title.includes('機車')) return '機車';
  if (title.includes('商品') || title.includes('貨品') || title.includes('設備')) return '商品';
  if (title.includes('企業') || title.includes('營運')) return '企業';
  if (title.includes('債務') || title.includes('協商') || title.includes('整合')) return '理債';
  return '資金';
}

function sceneSlug(keyword: string) {
  switch (keyword) {
    case '信用':
      return 'credit';
    case '理債':
      return 'debt';
    case '房屋':
      return 'mortgage';
    case '汽車':
      return 'car';
    case '機車':
      return 'scooter';
    case '商品':
      return 'product';
    case '手機':
      return 'mobile';
    case '學業':
      return 'student';
    case '企業':
      return 'business';
    default:
      return 'generic';
  }
}

function serviceArtSceneLabel(keyword: string) {
  switch (keyword) {
    case '信用':
      return '信用整理';
    case '理債':
      return '債務盤點';
    case '房屋':
      return '房貸評估';
    case '汽車':
      return '車貸估值';
    case '機車':
      return '機車評估';
    case '商品':
      return '商品週轉';
    case '手機':
      return '手機方案';
    case '學業':
      return '學生方案';
    case '企業':
      return '企業審視';
    default:
      return '資金規劃';
  }
}

function serviceArtScene(keyword: string, theme: { accent: string }) {
  switch (keyword) {
    case '信用':
      return `
        <g transform="translate(700 182) rotate(8)">
          <rect x="0" y="0" width="310" height="222" rx="32" fill="#fff" fill-opacity="0.18" stroke="#fff" stroke-opacity="0.24"/>
          <rect x="32" y="30" width="246" height="66" rx="18" fill="#08152e" fill-opacity="0.18"/>
          <rect x="46" y="44" width="142" height="12" rx="6" fill="#fff" fill-opacity="0.8"/>
          <rect x="46" y="68" width="178" height="8" rx="4" fill="#fff" fill-opacity="0.36"/>
          <rect x="32" y="112" width="136" height="72" rx="20" fill="${theme.accent}"/>
          <circle cx="100" cy="148" r="24" fill="#fff"/>
          <path d="M88 148l8 9 16-19" stroke="#0f2a54" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="180" y="114" width="98" height="24" rx="12" fill="#fff" fill-opacity="0.7"/>
          <rect x="180" y="148" width="98" height="16" rx="8" fill="#fff" fill-opacity="0.36"/>
          <rect x="180" y="174" width="78" height="16" rx="8" fill="#fff" fill-opacity="0.2"/>
        </g>
        <g transform="translate(136 500)">
          <rect width="224" height="84" rx="28" fill="#fff" fill-opacity="0.14" stroke="#fff" stroke-opacity="0.16"/>
          <path d="M32 58h160" stroke="#fff" stroke-opacity="0.65" stroke-width="8" stroke-linecap="round"/>
          <path d="M34 58c30-12 48-25 72-25 22 0 31 14 49 14 18 0 27-10 49-26" stroke="${theme.accent}" stroke-width="8" stroke-linecap="round" fill="none"/>
        </g>
        <g transform="translate(454 510)">
          <rect width="205" height="74" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="102" y="46" text-anchor="middle" fill="#fff" font-size="26" font-weight="800" font-family="Noto Sans TC, sans-serif">卡費 / 月付</text>
        </g>
      `;
    case '理債':
      return `
        <g transform="translate(716 184) rotate(8)">
          <rect x="0" y="0" width="294" height="230" rx="28" fill="#fff" fill-opacity="0.16" stroke="#fff" stroke-opacity="0.22"/>
          <path d="M28 54h168l36 40-36 40H28z" fill="#08152e" fill-opacity="0.22"/>
          <path d="M36 54h164l26 31-26 29H36z" fill="${theme.accent}" fill-opacity="0.95"/>
          <path d="M74 68c-12 14-14 31-4 44 10 13 31 17 48 10" stroke="#fff" stroke-opacity="0.8" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M168 70c11 16 11 33 0 47-10 13-29 18-45 11" stroke="#fff" stroke-opacity="0.6" stroke-width="7" stroke-linecap="round" fill="none"/>
          <rect x="42" y="144" width="202" height="54" rx="18" fill="#fff" fill-opacity="0.14"/>
          <circle cx="88" cy="171" r="18" fill="#fff"/>
          <path d="M88 155v32M72 171h32" stroke="#0f2a54" stroke-width="7" stroke-linecap="round"/>
        </g>
        <g transform="translate(128 500)">
          <rect width="252" height="82" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M34 58h176" stroke="#fff" stroke-opacity="0.6" stroke-width="8" stroke-linecap="round"/>
          <path d="M34 58l18-14 20 11 22-20 20 7 24-16 20 14 20-8" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(468 508)">
          <rect width="188" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="94" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">整合月付</text>
        </g>
      `;
    case '房屋':
      return `
        <g transform="translate(708 176)">
          <path d="M30 126l122-86 122 86v120H30z" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.2" stroke-width="2"/>
          <path d="M77 246V152h54v94z" fill="${theme.accent}" fill-opacity="0.92"/>
          <path d="M135 92h46l26 22v42h-72z" fill="#fff" fill-opacity="0.28"/>
          <path d="M70 124h82" stroke="#fff" stroke-opacity="0.6" stroke-width="8" stroke-linecap="round"/>
          <path d="M94 124v-34h54v34" stroke="#fff" stroke-opacity="0.8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <rect x="172" y="130" width="92" height="54" rx="18" fill="#08152e" fill-opacity="0.18"/>
          <path d="M188 158h58" stroke="#fff" stroke-opacity="0.76" stroke-width="7" stroke-linecap="round"/>
          <path d="M194 146l12-10 14 8" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(148 500)">
          <rect width="230" height="80" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M38 54h154" stroke="#fff" stroke-opacity="0.65" stroke-width="8" stroke-linecap="round"/>
          <path d="M40 54l26-16 22 6 18-18 22 9 20-14 24 8" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(458 508)">
          <rect width="194" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="97" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">估值 / 成數</text>
        </g>
      `;
    case '汽車':
      return `
        <g transform="translate(694 214)">
          <ellipse cx="162" cy="248" rx="168" ry="58" fill="#08152e" fill-opacity="0.22"/>
          <path d="M46 195c20-54 74-92 130-92 60 0 115 32 136 86l16 38H28z" fill="#fff" fill-opacity="0.14" stroke="#fff" stroke-opacity="0.18"/>
          <path d="M96 150h142c14 0 22 6 28 18l16 28H72l14-28c6-12 14-18 10-18z" fill="#fff" fill-opacity="0.74"/>
          <circle cx="104" cy="234" r="34" fill="#08152e" fill-opacity="0.6"/>
          <circle cx="104" cy="234" r="20" fill="#fff"/>
          <circle cx="236" cy="234" r="34" fill="#08152e" fill-opacity="0.6"/>
          <circle cx="236" cy="234" r="20" fill="#fff"/>
          <path d="M94 178h166" stroke="#0f2a54" stroke-opacity="0.24" stroke-width="4"/>
          <path d="M136 130l34-40h66l30 40" stroke="#fff" stroke-opacity="0.72" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <rect x="242" y="118" width="98" height="62" rx="22" fill="${theme.accent}" fill-opacity="0.96"/>
          <path d="M264 146h50M288 124v44" stroke="#0f2a54" stroke-width="8" stroke-linecap="round"/>
        </g>
        <g transform="translate(128 500)">
          <rect width="250" height="82" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M34 58h172" stroke="#fff" stroke-opacity="0.62" stroke-width="8" stroke-linecap="round"/>
          <path d="M50 58l30-18 22 7 20-16 24 9 20-12 28 8" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(470 508)">
          <rect width="184" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="92" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">買車 / 找錢</text>
        </g>
      `;
    case '機車':
      return `
        <g transform="translate(704 206)">
          <path d="M54 236c0-32 26-58 58-58s58 26 58 58" fill="none" stroke="#fff" stroke-opacity="0.36" stroke-width="16" stroke-linecap="round"/>
          <path d="M214 236c0-32 26-58 58-58s58 26 58 58" fill="none" stroke="#fff" stroke-opacity="0.36" stroke-width="16" stroke-linecap="round"/>
          <path d="M114 126h62l28 34h64c10 0 18 8 18 18s-8 18-18 18h-78l-22-30H130z" fill="#fff" fill-opacity="0.22" stroke="#fff" stroke-opacity="0.26"/>
          <path d="M146 126l22 34h58" stroke="${theme.accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <circle cx="112" cy="236" r="34" fill="#08152e" fill-opacity="0.58"/>
          <circle cx="112" cy="236" r="18" fill="#fff"/>
          <circle cx="240" cy="236" r="34" fill="#08152e" fill-opacity="0.58"/>
          <circle cx="240" cy="236" r="18" fill="#fff"/>
          <path d="M156 178h70" stroke="#fff" stroke-opacity="0.8" stroke-width="10" stroke-linecap="round"/>
        </g>
        <g transform="translate(120 500)">
          <rect width="248" height="82" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M36 58h170" stroke="#fff" stroke-opacity="0.64" stroke-width="8" stroke-linecap="round"/>
          <path d="M44 58l28-16 22 6 20-14 22 8 22-10 24 8" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(468 508)">
          <rect width="188" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="94" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">通勤資金</text>
        </g>
      `;
    case '企業':
      return `
        <g transform="translate(708 180)">
          <rect x="34" y="76" width="132" height="174" rx="24" fill="#fff" fill-opacity="0.16" stroke="#fff" stroke-opacity="0.22"/>
          <rect x="62" y="102" width="22" height="22" rx="7" fill="#fff" fill-opacity="0.8"/>
          <rect x="98" y="102" width="22" height="22" rx="7" fill="#fff" fill-opacity="0.55"/>
          <rect x="62" y="138" width="22" height="22" rx="7" fill="#fff" fill-opacity="0.55"/>
          <rect x="98" y="138" width="22" height="22" rx="7" fill="#fff" fill-opacity="0.8"/>
          <rect x="60" y="184" width="78" height="66" rx="16" fill="${theme.accent}" fill-opacity="0.95"/>
          <path d="M220 114h84v136h-84z" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.22"/>
          <path d="M240 158h46M240 186h46M240 130h46" stroke="#fff" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
          <path d="M224 92l38-32 38 32" stroke="#fff" stroke-opacity="0.7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(128 500)">
          <rect width="250" height="82" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M34 58h172" stroke="#fff" stroke-opacity="0.64" stroke-width="8" stroke-linecap="round"/>
          <path d="M34 58l22-8 18 10 20-18 22 6 24-14 22 16 18-10" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(470 508)">
          <rect width="188" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="94" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">營運資金</text>
        </g>
      `;
    case '商品':
      return `
        <g transform="translate(706 186)">
          <rect x="38" y="118" width="98" height="98" rx="18" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.18"/>
          <rect x="76" y="78" width="108" height="108" rx="18" fill="#fff" fill-opacity="0.18" stroke="#fff" stroke-opacity="0.22"/>
          <rect x="172" y="110" width="112" height="112" rx="18" fill="${theme.accent}" fill-opacity="0.96"/>
          <path d="M60 144h54M60 168h54" stroke="#fff" stroke-opacity="0.7" stroke-width="8" stroke-linecap="round"/>
          <path d="M98 98l0 78" stroke="#0f2a54" stroke-opacity="0.22" stroke-width="6"/>
          <path d="M128 128l24 24 36-42" stroke="#0f2a54" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M210 78h74v74h-74z" fill="#fff" fill-opacity="0.18" stroke="#fff" stroke-opacity="0.24"/>
          <path d="M222 94h50M222 118h50" stroke="#fff" stroke-opacity="0.7" stroke-width="7" stroke-linecap="round"/>
        </g>
        <g transform="translate(126 500)">
          <rect width="250" height="82" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M34 58h172" stroke="#fff" stroke-opacity="0.64" stroke-width="8" stroke-linecap="round"/>
          <path d="M42 58l26-14 24 8 22-16 22 8 24-12" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(468 508)">
          <rect width="188" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="94" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">商品週轉</text>
        </g>
      `;
    case '手機':
      return `
        <g transform="translate(738 188) rotate(9)">
          <rect x="0" y="0" width="214" height="350" rx="36" fill="#fff" fill-opacity="0.18" stroke="#fff" stroke-opacity="0.22"/>
          <rect x="24" y="28" width="166" height="292" rx="28" fill="#0f1e39" fill-opacity="0.34"/>
          <rect x="44" y="52" width="126" height="66" rx="16" fill="${theme.accent}" fill-opacity="0.95"/>
          <path d="M62 86h90" stroke="#0f2a54" stroke-width="8" stroke-linecap="round"/>
          <circle cx="108" cy="168" r="26" fill="#fff"/>
          <path d="M96 168l9 9 19-23" stroke="#0f2a54" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="44" y="134" width="126" height="24" rx="12" fill="#fff" fill-opacity="0.22"/>
          <rect x="44" y="172" width="126" height="16" rx="8" fill="#fff" fill-opacity="0.12"/>
        </g>
        <g transform="translate(118 510)">
          <circle cx="52" cy="32" r="26" fill="#fff" fill-opacity="0.18"/>
          <path d="M34 32h36" stroke="#fff" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
          <path d="M52 14v36" stroke="#fff" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
          <rect x="118" y="12" width="150" height="40" rx="20" fill="#fff" fill-opacity="0.14" stroke="#fff" stroke-opacity="0.14"/>
          <text x="193" y="39" text-anchor="middle" fill="#fff" font-size="22" font-weight="800" font-family="Noto Sans TC, sans-serif">免留機</text>
        </g>
        <g transform="translate(446 510)">
          <rect width="202" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="101" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">快速週轉</text>
        </g>
      `;
    case '學業':
      return `
        <g transform="translate(694 182)">
          <circle cx="140" cy="82" r="72" fill="#fff" fill-opacity="0.16" stroke="#fff" stroke-opacity="0.2"/>
          <path d="M98 74l42-24 42 24-42 24z" fill="${theme.accent}" fill-opacity="0.96"/>
          <path d="M106 86v22c0 12 68 12 68 0V86" fill="#fff" fill-opacity="0.18"/>
          <rect x="46" y="158" width="210" height="132" rx="26" fill="#fff" fill-opacity="0.14" stroke="#fff" stroke-opacity="0.22"/>
          <path d="M70 186h162" stroke="#fff" stroke-opacity="0.68" stroke-width="8" stroke-linecap="round"/>
          <path d="M70 216h132" stroke="#fff" stroke-opacity="0.42" stroke-width="8" stroke-linecap="round"/>
          <path d="M70 246h100" stroke="#fff" stroke-opacity="0.32" stroke-width="8" stroke-linecap="round"/>
          <rect x="206" y="208" width="88" height="82" rx="18" fill="#fff" fill-opacity="0.16"/>
          <path d="M230 234h40M230 258h28" stroke="#fff" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
        </g>
        <g transform="translate(132 500)">
          <rect width="250" height="82" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <path d="M34 58h172" stroke="#fff" stroke-opacity="0.64" stroke-width="8" stroke-linecap="round"/>
          <path d="M42 58l24-14 24 8 20-16 22 7 24-12" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
        <g transform="translate(470 508)">
          <rect width="188" height="78" rx="24" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.14"/>
          <text x="94" y="49" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Noto Sans TC, sans-serif">學費 / 生活費</text>
        </g>
      `;
    default:
      return `
        <g transform="translate(704 188)">
          <rect x="42" y="112" width="186" height="126" rx="28" fill="#fff" fill-opacity="0.14" stroke="#fff" stroke-opacity="0.18"/>
          <path d="M70 142h130" stroke="#fff" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
          <path d="M70 170h104" stroke="#fff" stroke-opacity="0.42" stroke-width="8" stroke-linecap="round"/>
          <path d="M70 198h84" stroke="#fff" stroke-opacity="0.28" stroke-width="8" stroke-linecap="round"/>
          <circle cx="250" cy="168" r="54" fill="${theme.accent}" fill-opacity="0.96"/>
          <path d="M226 168h48" stroke="#0f2a54" stroke-width="10" stroke-linecap="round"/>
          <path d="M250 144v48" stroke="#0f2a54" stroke-width="10" stroke-linecap="round"/>
        </g>
      `;
  }
}

function buildServiceCardArt(themeOrTitle: string, title: string, desc?: string) {
  const registryTheme = desc ? serviceCardThemeRegistry.get(`${title}|${desc}`) : undefined;
  const keyword = desc ? registryTheme ?? themeOrTitle : cardKeyword(themeOrTitle);
  const actualTitle = desc ? title : themeOrTitle;
  const actualDesc = desc ?? title;
  const hash = hashString(`${actualTitle}|${actualDesc}`).toString(16);
  return `/service-art/${sceneSlug(keyword)}-${hash}.svg`;
}

function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return pathname;
}

function getServicePageConfig(service: ServiceDetail): ServicePageConfig {
  switch (service.title) {
    case '信用貸款':
      return {
        bannerTheme: { from: '#0b1b37', via: '#1557a6', to: '#7fc5ff', accent: '#f7c84b', glow: '#7cc0ff' },
        faq: [
          { q: '是否年資一定要滿半年，才能申請信貸？', a: '不一定，每個案件會依職業、收入結構與整體條件一起看，先諮詢比較準。' },
          { q: '申請信用貸款需要準備哪些文件？', a: '通常會先看身分資料、收入證明與用途說明，實際文件依案件而定。' },
          { q: '信用額度是不是要看月薪22倍？', a: '這是常見參考概念，但實際額度還會一起看負債比、聯徵與工作穩定度。' },
          { q: '若銀行信貸不核准，是否換別家申請會有機會？', a: '每家評估重點不同，但不建議盲目重送，先整理條件再決定會比較好。' },
          { q: '本身已有信貸，還能再申請嗎？', a: '有機會，但要看現有月付、負債比與收入狀況，先評估會更清楚。' },
          { q: '信用分數的意義是什麼？', a: '它反映你的繳款、往來與信用使用習慣，通常會影響整體評估方向。' },
          { q: '動用信用卡循環會影響信用分數嗎？', a: '一般來說會成為觀察項目之一，建議先了解總成本與現金流影響。' },
          { q: '有信用卡預借現金，會影響信貸嗎？', a: '預借現金可能反映短期資金壓力，建議先讓專人看整體狀況。' },
          { q: '信用卡有遲繳紀錄可以申請嗎？', a: '仍可先諮詢，但需要看遲繳情況、時間點與現在的整體條件。' },
          { q: '可以先查自己的聯徵紀錄嗎？', a: '可以，先了解自己的信用狀況，再決定是否要進一步詢問會更安心。' },
        ],
        ctaTitle: '先了解信用貸款適不適合你',
        ctaDesc: '如果你想先看月付壓力、額度方向或文件重點，先留下資料，我們幫你整理清楚。',
      };
    case '整合負債':
      return {
        bannerTheme: { from: '#0c1f34', via: '#1e6db8', to: '#8fd4ff', accent: '#ffd46f', glow: '#72c8ff' },
        faq: [
          { q: '整合負債和一般貸款差在哪？', a: '整合負債重點是把多筆負擔重新整理成較好管理的結構，不是單純再借一筆。' },
          { q: '整合後月付一定會變低嗎？', a: '不一定，要看原本總額、期數與新條件，先試算會比較清楚。' },
          { q: '卡費很多也可以先問嗎？', a: '可以，先把各筆月付與剩餘期數整理出來，再判斷是否適合往下。' },
          { q: '整合負債會影響信用分數嗎？', a: '會看整體流程與後續繳款狀況，通常建議先把條件與可能影響先問清楚。' },
          { q: '整合負債可以幫我降低月付嗎？', a: '有機會，但要看原本債務結構、還款年限與新方案條件，不能只看單一數字。' },
          { q: '整合負債會影響信用卡使用嗎？', a: '不同方案做法不同，若有使用需求，應先確認是否能保留原本使用習慣。' },
          { q: '整合負債要準備哪些條件？', a: '通常會先看債務明細、收入、月付壓力與近期信用狀況。' },
          { q: '若債務已經超過月薪22倍怎麼辦？', a: '先不要慌，這種情況更需要先把債務順序與壓力整理出來，再看是否有方向。' },
        ],
        ctaTitle: '先把壓力整理，再看整合方向',
        ctaDesc: '你可以先把每月支出與負擔整理好，我們再幫你評估是否適合整合。',
      };
    case '房屋貸款':
      return {
        bannerTheme: { from: '#0c1730', via: '#184f97', to: '#86c2ff', accent: '#e3b24f', glow: '#8cc4ff' },
        faq: [
          { q: '房屋貸款的優勢？', a: '房屋貸款通常有機會取得較大額度，因為有不動產作為擔保，適合先看完整條件再決定。' },
          { q: '已經有房貸還可以申請房屋貸款嗎？', a: '可以先諮詢，因為是否可辦要看目前房屋殘值、原房貸狀況與用途。' },
          { q: '房屋貸款申請的流程需要多久？', a: '會依文件完整度與案件內容而定，通常先完成評估後會再說明流程。' },
          { q: '房屋貸款的額度如何計算？', a: '常見會看房屋估值、可貸成數與原有負債狀況，不是只看單一數字。' },
          { q: '房貸申請需要保證人嗎？', a: '不一定，要看方案與條件，有些案件可先由專人協助評估。' },
          { q: '房屋有私設可以辦房貸嗎？', a: '實際要看私設狀況與權屬安排，建議先讓專人確認。' },
          { q: '跟銀行申請房屋增貸未通過怎麼辦？', a: '可以再看是不是文件、條件或用途不完整，先整理後再評估會比較好。' },
          { q: '我有信用瑕疵還可以申請嗎？', a: '不一定直接排除，但會影響方案判斷，建議先評估後再決定。' },
          { q: '近期沒有工作可以申請房貸嗎？', a: '仍可先諮詢，因為房屋類方案也會看資產條件與整體可行性。' },
          { q: '借貸人 / 所有權人年紀太大還能辦嗎？', a: '年齡與權屬會影響評估，但仍可先看整體條件與可行方向。' },
          { q: '屋齡過高會影響申請嗎？', a: '屋齡會影響房屋價值與可貸方向，先看殘值會比較實際。' },
          { q: '找不到符合期待的方案怎麼辦？', a: '可以先比較一胎、增貸與二胎的差異，再找出比較適合的方向。' },
          { q: '近期想增貸可以先問嗎？', a: '可以，先了解可貸空間與成本，再決定要不要往下。' },
          { q: '沒財力、待業中還能看嗎？', a: '可以先評估，房屋類案件還是會看整體條件與可行性。' },
          { q: '月付金太重可以怎麼處理？', a: '可先看是否有重整結構、調整年限或其他方式降低壓力。' },
        ],
        ctaTitle: '想看房屋方案的額度與條件？',
        ctaDesc: '先讓專人看過你的房屋條件與用途，會比較容易知道適合的方向。',
      };
    case '汽車貸款':
      return {
        bannerTheme: { from: '#0b1b30', via: '#184a8f', to: '#7ec2ff', accent: '#f2c14b', glow: '#77c1ff' },
        faq: [
          { q: '不是買車，也可以辦理汽車貸款嗎？', a: '可以，汽車貸款不只限買車，也常用於原車融資、增貸或資金週轉。' },
          { q: '機車也可以貸款？額度能到多少？', a: '可以，但條件與額度通常會與汽車不同，還是要看車齡、車況與權屬。' },
          { q: '汽車貸款有車種限制嗎？有車齡限制嗎？', a: '會有差異，不同方案對車種與車齡的要求不同，需依實際評估。' },
          { q: '汽車貸款的額度能有多少呢？', a: '通常會看車價、殘值、持有狀況與用途，實際額度需先評估。' },
          { q: '信用分數會影響車貸嗎？', a: '會，信用分數與聯徵紀錄都是重要觀察項目之一。' },
          { q: '汽車貸款需要保證人嗎？', a: '不一定，需依案件條件與申請方式來看。' },
          { q: '車貸尚未繳清可以賣車嗎？', a: '要看車上是否還有貸款或設定，實際處理方式需先確認文件與權屬。' },
          { q: '車貸遲繳會影響信用分數嗎？', a: '一般來說會影響，建議先了解逾期狀況與後續處理方式。' },
          { q: '車貸若額不出來會怎樣？', a: '代表當下條件與方案可能不夠匹配，可以先整理資料再評估其他方向。' },
          { q: '有辦法提高車貸成功率嗎？', a: '先把車況、收入、聯徵與用途整理清楚，會更容易判斷適合方向。' },
        ],
        ctaTitle: '先看你的汽車條件能不能用',
        ctaDesc: '如果你想知道車齡、車況和文件是否可行，先留資料會比較快。',
      };
    case '機車貸款':
      return {
        bannerTheme: { from: '#0b1b30', via: '#184a8f', to: '#7ec2ff', accent: '#f2c14b', glow: '#77c1ff' },
        faq: [
          { q: '機車貸款一定要車況很好嗎？', a: '不一定，但車況、車齡與權屬會影響條件與可行方向。' },
          { q: '機車貸款可以先諮詢嗎？', a: '可以，先把車籍與需求說明清楚，再由專人評估。' },
          { q: '機車方案通常適合什麼情況？', a: '多半適合小額週轉、短期需求或想先快速了解可行方向的人。' },
          { q: '機車貸款可保留日常使用嗎？', a: '部分安排會看你是否仍需要通勤使用，實際需先說明。' },
          { q: '沒有保人也可以嗎？', a: '仍要依條件與方案判斷，不一定每個案件都需要保人。' },
          { q: '機車車齡會影響多少？', a: '會，車齡與車況通常是重要評估因子之一。' },
        ],
        ctaTitle: '先看你的機車條件能不能用',
        ctaDesc: '如果你想知道車齡、車況和文件是否可行，先留資料會比較快。',
      };
    case '債務協商':
      return {
        bannerTheme: { from: '#101728', via: '#29588f', to: '#7db9ee', accent: '#ffd56e', glow: '#88c8ff' },
        faq: [
          { q: '債務協商與整合負債的差別？該如何選擇？', a: '如果條件還能承擔，多半先考慮整合負債；若無法整合，才會往債務協商方向評估。' },
          { q: '所有貸款都能列入債務協商嗎？', a: '不一定，要看債權類型、還款狀況與整體評估結果。' },
          { q: '辦理債務協商就是信用破產嗎？', a: '不是，但會有信用註記與後續影響，申請前務必先了解。' },
          { q: '債務協商有什麼優點？', a: '可望重新整理還款方式、降低月付壓力，讓債務變得更好管理。' },
          { q: '債務協商可以順便多拿一筆資金嗎？', a: '通常不是這樣運作，重點是協調既有債務，不是再多借一筆。' },
          { q: '只欠一家銀行可以辦理前置協商嗎？', a: '是否可行仍要看實際條件與債務結構，先諮詢比較準。' },
          { q: '如果銀行不跟我談債務協商怎麼辦？', a: '可以先評估是不是整合負債或其他安排更適合，先把條件整理清楚。' },
          { q: '申請債務協商需要準備哪些文件？', a: '通常會需要債務明細、收入資料與身分文件，實際依案件而定。' },
          { q: '債務協商申請過程中需注意什麼？', a: '要先理解註記影響、還款安排與後續限制，避免只看月付。' },
          { q: '申請債務協商後銀行會停止催收嗎？', a: '是否會因申請而暫停，需視程序與狀況而定，建議先問清楚。' },
          { q: '債務協商後若還款有困難怎麼辦？', a: '若後續又遇到困難，應盡快與專人討論是否有其他調整空間。' },
          { q: '還債好累，我可以直接申請破產嗎？', a: '要先了解各種方案差異與法律效果，不能只看單一選項。' },
        ],
        ctaTitle: '先把協商流程看懂，再決定',
        ctaDesc: '如果你現在壓力比較大，可以先把現況說明，我們幫你整理可行方向。',
      };
    case '企業貸款':
      return {
        bannerTheme: { from: '#0e1b32', via: '#1f5da2', to: '#86c7ff', accent: '#f7c95a', glow: '#8fd0ff' },
        faq: [
          { q: '申請企業貸款需要準備哪些資料？', a: '通常會先看營利事業登記、負責人資料、報稅、財報與近期營運相關文件。' },
          { q: '剛成立的公司能申請企業貸款嗎？', a: '有些方案可看新創或成立不久的公司，仍要依實際條件與用途評估。' },
          { q: '財務報表不漂亮可以申請企業貸款嗎？', a: '可以先諮詢，不同方案對財報要求不一樣，會先看整體營運與條件。' },
          { q: '沒有擔保品可以申請企業貸款嗎？', a: '部分方案可看信用、營運與政府或信保支持，不一定都需要擔保。' },
          { q: '負責人有信貸會影響企業貸款嗎？', a: '會一起被考量，但仍要看公司營運與整體條件。' },
          { q: '已經申請過其他貸款還能再申請嗎？', a: '可以先諮詢，因為是否能再申請要看現有負債與資金用途。' },
          { q: '近期更換負責人可以申請企業貸款嗎？', a: '可先評估，因為變更後的資料與風險結構會影響判斷。' },
          { q: '連帶保證人需要負什麼責任？', a: '連帶保證的法律責任較重，申請前務必先完整了解。' },
        ],
        ctaTitle: '企業營運需要的資金，先評估再說',
        ctaDesc: '不論是採購、周轉或專案支出，都可以先把需求整理清楚再談。',
      };
    case '商品貸款':
      return {
        bannerTheme: { from: '#16203a', via: '#2d67a6', to: '#91cbff', accent: '#f7c95b', glow: '#83c9ff' },
        faq: [
          { q: '商品貸款一定是買實體商品嗎？', a: '多半會看用途與交易內容，設備、貨品或專案支出都可能屬於不同規劃。' },
          { q: '需要先有品項清單嗎？', a: '建議先有大概的用途與金額，這樣會比較快判斷適不適合。' },
          { q: '分期和商品貸款一樣嗎？', a: '不完全一樣，重點在用途明確度與付款安排，流程也可能不同。' },
          { q: '商品貸款適合採購備貨嗎？', a: '適合先把貨品、數量與付款時間整理好，再看資金是否能銜接。' },
          { q: '設備更新也能先問嗎？', a: '可以，設備汰換、器材更新或專案型支出都能先做評估。' },
          { q: '需要一次講清楚付款方式嗎？', a: '建議先把期數、合約與付款節奏說明清楚，會更有助於判斷。' },
        ],
        ctaTitle: '商品採購先看好資金安排',
        ctaDesc: '如果你有採購或備貨需求，可以先把用途與預算整理起來。',
      };
    case '手機貸款':
      return {
        bannerTheme: { from: '#0f1d37', via: '#2460a8', to: '#8accff', accent: '#f2c24b', glow: '#84c6ff' },
        faq: [
          { q: '手機貸款是小額週轉嗎？', a: '通常會以較小額、較短期的需求為主，適合先了解短週期安排。' },
          { q: '金額不大也值得先問嗎？', a: '可以，因為小額也有總成本差異，先看清楚會更安心。' },
          { q: '資料要準備很多嗎？', a: '通常不會太複雜，但還是要先看你的情況與需要的資訊。' },
          { q: '手機貸款適合急件嗎？', a: '若是短期缺口或急件安排，先把需求說明清楚會比較快。' },
          { q: '收入不穩定也可以問嗎？', a: '可以先諮詢，不同方案對收入穩定度的要求會不同。' },
          { q: '手機貸款一定要很快決定嗎？', a: '不需要，可以先了解再決定，不必急著做選擇。' },
        ],
        ctaTitle: '小額需求也可以先問清楚',
        ctaDesc: '如果只是短期小額安排，先讓專人幫你看條件會更有效率。',
      };
    default:
      return {
        bannerTheme: { from: '#0b1b37', via: '#1557a6', to: '#7fc5ff', accent: '#f7c84b', glow: '#7cc0ff' },
        faq: [
          { q: `這個方案適合我嗎？`, a: '可以先諮詢，由專人依你的條件與用途評估是否有適合方向。' },
          { q: `需要先準備很多資料嗎？`, a: '先準備基本聯絡資料與你想了解的用途即可，其他會再一起說明。' },
          { q: `可以先了解再決定嗎？`, a: '可以，我們的流程就是先看懂，再決定要不要往下。' },
        ],
        ctaTitle: `先了解 ${service.title}，再決定下一步`,
        ctaDesc: '留下資料後，專人會先幫你看條件，再說明是否適合往下。',
      };
  }
}

function createServiceBanner(service: ServiceDetail, theme: ServicePageConfig['bannerTheme']) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${service.title}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fbfdff" />
        <stop offset="52%" stop-color="${theme.to}" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#eef5ff" />
      </linearGradient>
      <radialGradient id="glow" cx="22%" cy="18%" r="70%">
        <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.18" />
        <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${theme.from}" />
        <stop offset="55%" stop-color="${theme.via}" />
        <stop offset="100%" stop-color="${theme.to}" />
      </linearGradient>
      <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="0.94" />
        <stop offset="100%" stop-color="white" stop-opacity="0.76" />
      </radialGradient>
    </defs>
    <rect width="1200" height="720" rx="56" fill="url(#bg)" />
    <rect width="1200" height="720" rx="56" fill="url(#glow)" />
    <circle cx="180" cy="132" r="96" fill="${theme.accent}" opacity="0.14" />
    <circle cx="1010" cy="104" r="82" fill="${theme.to}" opacity="0.16" />
    <circle cx="950" cy="560" r="160" fill="${theme.glow}" opacity="0.08" />
    <path d="M110 560c120-56 235-62 360-28 118 32 224 88 360 60s236-90 330-70" fill="none" stroke="${theme.from}" stroke-opacity="0.16" stroke-width="10" stroke-linecap="round" />

    <rect x="74" y="72" width="186" height="50" rx="25" fill="white" fill-opacity="0.75" stroke="${theme.from}" stroke-opacity="0.18" />
    <text x="167" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${theme.from}" font-weight="800">專屬方案頁</text>

    <rect x="74" y="154" width="520" height="388" rx="34" fill="url(#panel)" stroke="${theme.from}" stroke-opacity="0.12" />
    <rect x="74" y="154" width="520" height="72" rx="34" fill="url(#accentBar)" />
    <text x="104" y="202" font-family="Arial, sans-serif" font-size="30" fill="white" font-weight="800">方案導覽 / 重點提醒</text>

    <text x="104" y="292" font-family="Arial, sans-serif" font-size="70" fill="#0d2f62" font-weight="900">${service.title}</text>
    <text x="104" y="345" font-family="Arial, sans-serif" font-size="30" fill="#163963" font-weight="700">${service.subtitle}</text>
    <text x="104" y="388" font-family="Arial, sans-serif" font-size="22" fill="#33517a" font-weight="600">${service.who}</text>

    <rect x="104" y="428" width="210" height="60" rx="20" fill="${theme.accent}" fill-opacity="0.88" />
    <text x="209" y="467" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#0b1b37" font-weight="800">先看懂再決定</text>

    <rect x="340" y="428" width="220" height="60" rx="20" fill="white" fill-opacity="0.76" />
    <text x="450" y="465" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#1f3d66" font-weight="800">流程透明 · 好理解</text>

    <rect x="104" y="510" width="456" height="14" rx="7" fill="${theme.from}" fill-opacity="0.15" />
    <rect x="104" y="510" width="296" height="14" rx="7" fill="url(#accentBar)" />

    <rect x="660" y="88" width="460" height="544" rx="38" fill="white" fill-opacity="0.72" stroke="${theme.from}" stroke-opacity="0.12" />
    <rect x="694" y="122" width="392" height="88" rx="28" fill="white" fill-opacity="0.95" stroke="${theme.from}" stroke-opacity="0.10" />
    <text x="728" y="167" font-family="Arial, sans-serif" font-size="28" fill="${theme.from}" font-weight="800">先理解用途，再決定要不要往下</text>
    <text x="728" y="195" font-family="Arial, sans-serif" font-size="18" fill="#4a678f" font-weight="600">每個方案都先看重點，不急著做決定。</text>

    <rect x="694" y="236" width="392" height="112" rx="24" fill="${theme.from}" fill-opacity="0.08" />
    <rect x="694" y="236" width="392" height="112" rx="24" fill="none" stroke="${theme.from}" stroke-opacity="0.12" />
    <text x="728" y="282" font-family="Arial, sans-serif" font-size="22" fill="${theme.from}" font-weight="800">快速回覆</text>
    <text x="728" y="315" font-family="Arial, sans-serif" font-size="18" fill="#37547b" font-weight="600">先看資料，回覆更快。</text>

    <rect x="694" y="366" width="392" height="112" rx="24" fill="${theme.to}" fill-opacity="0.10" />
    <rect x="694" y="366" width="392" height="112" rx="24" fill="none" stroke="${theme.to}" stroke-opacity="0.14" />
    <text x="728" y="412" font-family="Arial, sans-serif" font-size="22" fill="#143965" font-weight="800">流程透明</text>
    <text x="728" y="445" font-family="Arial, sans-serif" font-size="18" fill="#37547b" font-weight="600">每一步先講清楚。</text>

    <rect x="694" y="496" width="392" height="100" rx="24" fill="${theme.accent}" fill-opacity="0.20" />
    <text x="728" y="540" font-family="Arial, sans-serif" font-size="22" fill="#0d2f62" font-weight="800">資料保密處理</text>
    <text x="728" y="572" font-family="Arial, sans-serif" font-size="18" fill="#37547b" font-weight="600">資料只用於聯繫與評估。</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'translate-y-4 opacity-0 transition-all duration-700 ease-out',
        isVisible && 'translate-y-0 opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc, tone = 'light', align = 'center' }: SectionHeadingProps) {
  const isDark = tone === 'dark';
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      <p className={cn('text-xs font-bold uppercase tracking-[0.32em]', isDark ? 'text-amber-300' : 'text-sky-700')}>
        {eyebrow}
      </p>
      <h2 className={cn('mt-3 text-3xl font-black tracking-tight sm:text-4xl', isDark ? 'text-white' : 'text-slate-900')}>
        {title}
      </h2>
      <p className={cn('mt-4 text-base leading-8 sm:text-lg', isDark ? 'text-slate-300' : 'text-slate-600')}>
        {desc}
      </p>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center', compact ? 'gap-3.5' : 'gap-4.5')}>
      <img
        src="/jiangyu.png"
        alt="品牌 Logo"
        className={cn(
          compact ? 'h-[5.25rem] w-[5.25rem] sm:h-[5.5rem] sm:w-[5.5rem]' : 'h-[5.75rem] w-[5.75rem] sm:h-[6.5rem] sm:w-[6.5rem]',
          'shrink-0 object-contain',
        )}
      />
      <div className="leading-tight">
        <p className={cn(compact ? 'text-[1.44rem] sm:text-[1.5rem]' : 'text-[1.42rem] sm:text-[1.58rem]', 'font-black tracking-[0.08em] text-slate-900')}>
          {brand.name}
        </p>
        <p className={cn(compact ? 'text-[0.7rem] sm:text-[0.74rem]' : 'text-[0.78rem] sm:text-[0.86rem]', 'font-semibold uppercase tracking-[0.38em] text-slate-500')}>
          {brand.subName}
        </p>
      </div>
    </div>
  );
}

function InlineIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid h-12 w-12 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700', className)}>
      {children}
    </div>
  );
}

function IconWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid h-14 w-14 place-items-center rounded-[20px] border border-sky-100 bg-gradient-to-br from-sky-50 to-white text-sky-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function FieldLabel({
  label,
  note,
  required,
  error,
  input,
}: {
  label: string;
  note?: string;
  required?: boolean;
  error?: string;
  input: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
        {note ? <span className="text-xs font-semibold text-slate-400">{note}</span> : null}
      </span>
      {input}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100';

const buttonBase =
  'inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-bold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 active:translate-y-0.5 active:scale-[0.99]';

const buttonStyles = {
  primary: cn(buttonBase, 'bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 text-white shadow-glow hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600'),
  secondary: cn(buttonBase, 'border border-slate-200 bg-white text-slate-900 shadow-soft hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50'),
  heroPrimary: cn(buttonBase, 'min-h-[58px] bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 text-white shadow-glow hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600'),
  heroSecondary: cn(buttonBase, 'min-h-[58px] border border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:bg-white/10'),
  form: cn(buttonBase, 'min-h-[60px] bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 text-white shadow-glow hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600'),
  footerPrimary: cn(buttonBase, 'bg-white text-slate-900 shadow-soft hover:-translate-y-0.5 hover:bg-slate-100'),
  footerSecondary: cn(buttonBase, 'border border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:bg-white/10'),
};

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const navItems = [
    { label: '首頁', href: '/#home' },
    { label: '最新消息', href: '/#news' },
    { label: '聯絡我們', href: '/#contact' },
  ];

  const goTo = (path: string) => {
    setMobileMenuOpen(false);
    navigateTo(path);
  };

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:min-h-[88px] sm:px-6 sm:py-4 lg:px-8 lg:py-4.5">
        <BrandMark compact />
        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
            >
              {item.label}
            </a>
          ))}
          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
            >
              服務項目
              <span className="text-xs transition group-hover:translate-y-0.5">▾</span>
            </button>
            <div className="pointer-events-none absolute left-0 top-full z-50 mt-3 w-[22rem] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold tracking-[0.28em] text-sky-700">SERVICE MENU</p>
                  <p className="mt-1 text-sm text-slate-500">點選後會進入各自的方案頁面</p>
                </div>
                <div className="max-h-[26rem] overflow-auto divide-y divide-slate-100">
                  {serviceDetails.map((item, index) => (
                    <button
                      key={item.anchorId}
                      type="button"
                      onClick={() => navigateTo(item.path)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-sky-100 bg-gradient-to-br from-sky-50 to-white text-sky-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                          <item.icon className="h-[26px] w-[26px]" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs leading-6 text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#contact" onClick={() => trackCtaClick('header_primary')} className={buttonStyles.secondary}>
            立即免費諮詢
          </a>
          <a href={brand.lineHref} onClick={() => trackLineClick('header_line')} className={buttonStyles.primary}>
            馬上加入 LINE
          </a>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((current) => !current);
              setMobileServicesOpen(false);
            }}
            className="inline-flex rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100"
          >
            選單
          </button>
          <a
            href={brand.lineHref}
            onClick={() => trackLineClick('header_line_mobile')}
            className="inline-flex rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100"
          >
            官方 LINE
          </a>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-bold tracking-[0.28em] text-sky-700">SERVICE MENU</p>
                <p className="mt-1 text-sm text-slate-500">點選後會進入各自的方案頁面</p>
              </div>
              <div className="divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">服務項目</span>
                  <span className={cn('text-xs text-slate-500 transition-transform', mobileServicesOpen && 'rotate-180')}>▾</span>
                </button>
                {mobileServicesOpen ? (
                  <div className="bg-slate-50/70">
                    {serviceDetails.map((item, index) => (
                      <button
                        key={item.anchorId}
                        type="button"
                        onClick={() => goTo(item.path)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-100"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border border-sky-100 bg-gradient-to-br from-white to-sky-50 text-sky-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                            <item.icon className="h-6 w-6" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                              <span className="text-xs text-slate-500">{item.subtitle}</span>
                            </div>
                            <p className="mt-1 line-clamp-1 text-xs leading-6 text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="grid gap-2 border-t border-slate-100 px-4 py-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function TopMarqueeSection() {
  const marqueeImages = [
    '/marquee-loan-ad.png',
    '/marquee-loan-ad-2.png',
    '/marquee-loan-ad-3.png',
    '/marquee-loan-ad-4.png',
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % marqueeImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [marqueeImages.length]);

  return (
    <section id="home" className="bg-white pt-0">
      <div className="w-full overflow-hidden">
          <div className="relative aspect-[1425/594] w-full overflow-hidden bg-[#0b1425]">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {marqueeImages.map((src, index) => (
              <div key={src} className="h-full w-full shrink-0">
                <img src={src} alt={`廣告輪播 ${index + 1}`} className="block h-full w-full object-cover object-center" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_18%,rgba(8,18,34,0.06)_100%)]" />
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
            {marqueeImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`切換到第 ${index + 1} 張廣告`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  activeIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#081222] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_80%_18%,_rgba(212,169,76,0.16),_transparent_24%),linear-gradient(180deg,_rgba(12,20,36,0.95)_0%,_rgba(8,18,34,1)_100%)]" />
      <div className="absolute inset-0 section-grid opacity-20" />
      <div className="absolute left-[-8rem] top-6 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-[-7rem] top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
              {['流程簡單', '審核快速', '專人服務'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.34em] text-amber-300">貸款服務 / 資金週轉快速諮詢</p>
            <h1 className="mt-3 max-w-2xl text-[2.4rem] font-black leading-[0.96] tracking-tight text-white text-balance sm:text-5xl lg:text-[4.1rem]">
              <span className="block">資金週轉</span>
              <span className="block headline-gradient">快速諮詢</span>
            </h1>
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-amber-300 via-sky-300 to-transparent" />
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8 lg:text-lg">
              先免費諮詢，再評估適合方向。免保人、快速審核、專人協助、線上申請。
            </p>

            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-3 shadow-soft backdrop-blur-sm sm:mt-6 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">現在就能開始</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200 sm:text-[0.98rem]">
                    留下資料後，專人會先幫你看條件，再告訴你適合往哪個方向走。
                  </p>
                </div>
                <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100">
                  先諮詢再評估，不強迫辦理
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a href="#contact" onClick={() => trackCtaClick('hero_primary')} className={buttonStyles.heroPrimary}>
                  立即免費諮詢
                </a>
                <a href={brand.lineHref} onClick={() => trackLineClick('hero_line')} className={buttonStyles.heroSecondary}>
                  馬上加入官方 LINE
                </a>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['快速回覆', '專人評估', '流程透明'].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-2 py-2 text-sm font-semibold text-white"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/15 text-[11px] font-black text-emerald-300">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
              <a
                href="#services"
                onClick={() => trackCtaClick('hero_see_plan')}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                立即了解方案
              </a>
              <a
                href="#contact"
                onClick={() => trackCtaClick('hero_assessment')}
                className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-400/15"
              >
                先評估我的條件
              </a>
              <a
                href={brand.telHref}
                onClick={() => trackPhoneClick('hero_phone')}
                className="inline-flex items-center rounded-full border border-sky-200/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:-translate-y-0.5 hover:bg-sky-400/15"
              >
                直接打電話
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-300">先諮詢再評估，不強迫辦理，資料也會嚴格保密。</p>

            <div className="mt-6 grid max-w-2xl gap-2.5 sm:mt-8 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['快速回覆', '一對一評估', '流程透明', '資料保密'].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/6 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.22)] backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,210,106,0.18),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_32%)]" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-amber-300">協助媒合多家銀行等金融機構貸款</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-white text-balance">
                  把「可信任感」放在第一眼
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  用更清楚的服務承諾與諮詢定位，讓廣告流量進站後先感受到專業與安心。
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    { badge: '智能 AI', title: '專業大數據', desc: '快速媒合', icon: ChartIcon },
                    { badge: '4.9 星服務', title: 'Google 好評', desc: '超過 4000 則', icon: SparkIcon },
                    { badge: '業界最多', title: '多人選擇', desc: '服務超過 288 萬人次', icon: LayersIcon },
                    { badge: '免費諮詢', title: '來電諮詢', desc: '免收評估費', icon: MessageIcon },
                    { badge: '收費合理', title: '透明費用', desc: '不事後加價', icon: StackIcon },
                    { badge: '安全無慮', title: '資料保密', desc: '全程保密處理', icon: LockIcon },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-4 py-5 shadow-[0_12px_24px_rgba(15,23,42,0.14)]"
                      >
                        <div className="grid h-14 w-14 place-items-center rounded-[18px] border border-white/15 bg-white/10 text-sky-200">
                          <Icon className="h-8 w-8" />
                        </div>
                        <span className="mt-4 inline-flex rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          {item.badge}
                        </span>
                        <p className="mt-4 text-lg font-black text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NeedSection() {
  return (
    <section id="services" className="bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">多元貸款方案、滿足資金需求</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              服務項目直接變成小卡片，方便快速掃描
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              先看每張卡片的用途與重點，再點進專屬頁面看完整介紹、科普細節與適合情境。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {serviceDetails.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.anchorId} delay={index * 45}>
                <button
                  type="button"
                  onClick={() => navigateTo(item.path)}
                  className="group premium-surface flex h-full w-full flex-col rounded-[26px] border border-slate-200 bg-white p-5 text-left shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_44px_rgba(15,23,42,0.09)]"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-amber-400 opacity-80 transition duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_28%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">方案 {String(index + 1).padStart(2, '0')}</p>
                      <h3 className="mt-3 text-xl font-black text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">{item.subtitle}</p>
                    </div>
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-sky-100/60 text-sky-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-300 group-hover:scale-105 group-hover:border-sky-200 group-hover:shadow-[0_18px_28px_rgba(37,99,235,0.12)]">
                      <Icon className="h-7 w-7" />
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">{item.tag}</span>
                    <span className="text-xs font-medium text-slate-400">點進看詳情</span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.desc}</p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-sky-700 transition group-hover:translate-x-0.5">進入專屬頁面 →</p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MatchSection() {
  return (
    <section id="services" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">服務項目</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">服務項目拆分，每個方案都看得懂</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              這一區把每個方案拆開說明，包含用途、適合情境與常見注意事項，讓你先理解差異，再決定要不要往下。
            </p>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['10 種方案', '用途先看懂', '科普細節', '先諮詢再決定'].map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800"
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serviceDetails.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 60}>
                <article
                  id={item.anchorId}
                  className="group scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex items-start gap-4 border-b border-slate-100 p-5">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-50 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                      <Icon className="h-7 w-7 text-sky-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          {item.tag}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {item.subtitle}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-black text-slate-900">{item.title}</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm leading-7 text-slate-600">{item.desc}</p>

                    <div className="mt-5 grid gap-3 rounded-2xl bg-[#f8fbff] p-4">
                      <div>
                        <p className="text-xs font-bold tracking-[0.24em] text-sky-700">適合誰</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{item.who}</p>
                      </div>

                      <div>
                        <p className="text-xs font-bold tracking-[0.24em] text-sky-700">科普重點</p>
                        <ul className="mt-2 space-y-2">
                          {item.tips.map((tip) => (
                            <li key={tip} className="flex items-start gap-2 text-sm leading-7 text-slate-700">
                              <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-bold tracking-[0.24em] text-amber-700">小知識</p>
                        <p className="mt-2 text-sm leading-7 text-amber-950/90">{item.note}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href="#contact"
                        onClick={() => trackCtaClick(`service_${index + 1}`)}
                        className="inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                      >
                        了解這個方案
                      </a>
                      <a
                        href="#calculator"
                        onClick={() => trackCtaClick(`service_calc_${index + 1}`)}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
                      >
                        先來試算
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 rounded-[28px] border border-sky-100 bg-sky-50 px-6 py-5">
          <p className="text-sm font-bold text-sky-800">科普提醒</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            以上內容是用來幫你快速理解方案差異，實際能否承作、額度與條件仍需由專人依資料與用途評估。
          </p>
        </div>
      </div>
    </section>
  );
}

function ArticleSection() {
  return (
    <section className="bg-[#f7f9fd] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">理財學堂</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">先看懂，再決定要不要往下</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              我們用簡單易懂的方式整理常見資金問題，讓你先建立基本概念。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal key={article.title} delay={index * 80}>
              <article className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-sky-700 px-3 py-1 text-xs font-bold text-white">
                    {article.tag}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{article.date}</p>
                  <h3 className="mt-3 text-xl font-bold leading-8 text-slate-900">{article.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                  <div className="mt-5">
                    <a
                      href={`#${article.detailId}`}
                      onClick={() => trackCtaClick(`article_${index + 1}`)}
                      className="inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoanCalculatorSection() {
  const [mode, setMode] = useState<CalculatorMode>('noGrace');
  const [principal, setPrincipal] = useState('1000000');
  const [annualRate, setAnnualRate] = useState('2.88');
  const [years, setYears] = useState('10');
  const [graceMonths, setGraceMonths] = useState('6');

  const loanAmount = Math.max(Number(principal) || 0, 0);
  const rate = Math.max(Number(annualRate) || 0, 0);
  const termYears = Math.max(Number(years) || 0, 0);
  const grace = Math.max(Number(graceMonths) || 0, 0);

  const totalMonths = Math.max(termYears * 12, 1);
  const effectiveGrace = mode === 'withGrace' ? Math.min(grace, Math.max(totalMonths - 1, 0)) : 0;
  const remainingMonths = Math.max(totalMonths - effectiveGrace, 1);
  const monthlyRate = rate / 100 / 12;

  const noGracePayment =
    monthlyRate === 0
      ? loanAmount / totalMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const graceInterestOnly = loanAmount * monthlyRate;
  const postGracePayment =
    monthlyRate === 0
      ? loanAmount / remainingMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
        (Math.pow(1 + monthlyRate, remainingMonths) - 1);

  const totalPaidNoGrace = noGracePayment * totalMonths;
  const totalInterestNoGrace = totalPaidNoGrace - loanAmount;
  const totalPaidWithGrace = graceInterestOnly * effectiveGrace + postGracePayment * remainingMonths;
  const totalInterestWithGrace = totalPaidWithGrace - loanAmount;
  const activeMonthlyPayment = mode === 'withGrace' ? graceInterestOnly : noGracePayment;

  return (
    <section id="calculator" className="bg-[#f7f9fd] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">貸款試算</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">先算清楚，再決定要不要往下</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              你可以先用這個工具快速試算每月壓力，了解無寬限期與有寬限期的差別。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-stretch">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-gradient-to-br from-slate-900 via-[#0d1b31] to-[#13294d] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_82%_12%,_rgba(212,169,76,0.18),_transparent_22%)]" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-amber-300">試算重點</p>
                <h3 className="mt-3 text-2xl font-black leading-9">先了解每月負擔，再決定方案</h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  透過簡單輸入，就能先知道大概的月付範圍。這樣不論是聯繫顧問，還是自行比較，都更有方向。
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: '快速判斷', value: '30 秒' },
                    { label: '模式切換', value: '寬限期' },
                    { label: '結果參考', value: '月付 / 總利息' },
                    { label: '適合用途', value: '先看壓力' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                      <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-slate-300">試算提醒</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    這是初步試算，實際條件仍要依收入、職業、信用與方案內容確認。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="surface-card rounded-[32px] p-5 sm:p-6">
              <div className="rounded-[26px] bg-[#f8fbff] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">計算表</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">貸款試算</h3>
                  </div>
                  <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                    互動試算
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <label className={cn('flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition', mode === 'noGrace' ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600')}>
                    <input
                      type="radio"
                      name="calculator-mode"
                      checked={mode === 'noGrace'}
                      onChange={() => setMode('noGrace')}
                      className="accent-sky-600"
                    />
                    無寬限期
                  </label>
                  <label className={cn('flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition', mode === 'withGrace' ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600')}>
                    <input
                      type="radio"
                      name="calculator-mode"
                      checked={mode === 'withGrace'}
                      onChange={() => setMode('withGrace')}
                      className="accent-sky-600"
                    />
                    有寬限期
                  </label>
                </div>

                <div className="mt-5 grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">貸款金額</span>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={principal}
                      onChange={(event) => setPrincipal(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      placeholder="例如：1000000"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">貸款利率（%）</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={annualRate}
                        onChange={(event) => setAnnualRate(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="例如：2.88"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">貸款年限（年）</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={years}
                        onChange={(event) => setYears(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="例如：10"
                      />
                    </label>
                  </div>

                  {mode === 'withGrace' ? (
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">寬限期（月）</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={graceMonths}
                        onChange={(event) => setGraceMonths(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="例如：6"
                      />
                    </label>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-sky-50 p-4">
                    <p className="text-xs font-semibold text-sky-700">每月需攤還本息</p>
                    <p className="mt-2 text-[1.65rem] font-black text-slate-900">NT$ {Math.round(activeMonthlyPayment).toLocaleString('zh-TW')}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-semibold text-amber-700">{mode === 'withGrace' ? '寬限期月付' : '總還款金額'}</p>
                    <p className="mt-2 text-[1.65rem] font-black text-slate-900">
                      {mode === 'withGrace'
                        ? `NT$ ${Math.round(graceInterestOnly).toLocaleString('zh-TW')}`
                        : `NT$ ${Math.round(totalPaidNoGrace).toLocaleString('zh-TW')}`}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold text-emerald-700">估算總利息</p>
                    <p className="mt-2 text-[1.65rem] font-black text-slate-900">
                      NT$ {Math.round(mode === 'withGrace' ? totalInterestWithGrace : totalInterestNoGrace).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </div>

                {mode === 'withGrace' ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-700">寬限期後月付試算</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">NT$ {Math.round(postGracePayment).toLocaleString('zh-TW')}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      寬限期結束後，月付會回到正常本息攤還，這個數字可以先作為後續壓力參考。
                    </p>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#contact" onClick={() => trackCtaClick('calculator_contact')} className={buttonStyles.primary}>
                    先幫我評估
                  </a>
                  <a href={brand.lineHref} onClick={() => trackLineClick('calculator_line')} className={buttonStyles.secondary}>
                    立即加入 LINE
                  </a>
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-500">
                  試算結果僅供初步參考，實際條件仍需由專人依個人資料與方案內容評估。
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ReportSection() {
  return (
    <section id="news" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">報導詳情</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">點擊了解更多，直接看完整報導</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              這裡把每篇文章延伸成更完整的說明，讓使用者點擊後能馬上看到重點整理。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 space-y-6">
          {articles.map((article, index) => (
            <Reveal key={article.detailId} delay={index * 80}>
              <article
                id={article.detailId}
                className="overflow-hidden rounded-[30px] border border-slate-100 bg-[#f8fbff] shadow-[0_14px_40px_rgba(15,23,42,0.07)]"
              >
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full min-h-[280px] w-full object-cover lg:min-h-[380px]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-700 shadow-soft">
                      報導 {index + 1}
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.32em] text-sky-700">{article.tag}</p>
                    <h3 className="mt-3 text-2xl font-black leading-9 text-slate-900">{article.title}</h3>
                    <p className="mt-3 text-sm font-semibold tracking-[0.2em] text-slate-400">{article.date}</p>
                    <p className="mt-5 text-base leading-8 text-slate-700">
                      {article.excerpt}
                      這篇報導的重點是先讓使用者知道自己目前所處的狀況，再決定要不要往下做進一步規劃。
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {article.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-700">
                            ✓
                          </span>
                          <p className="text-sm leading-6 text-slate-700">{bullet}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">
                      <p className="text-sm font-bold text-sky-800">延伸說明</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        如果你正在比較不同方案，可以先看這篇報導整理的判斷順序，再回到表單直接留下資料，會更有效率。
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href="#contact"
                        onClick={() => trackCtaClick(`report_cta_${index + 1}`)}
                        className="inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                      >
                        立即諮詢
                      </a>
                      <a
                        href="#contact"
                        onClick={() => trackCtaClick(`report_lead_${index + 1}`)}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
                      >
                        留下資料
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-[#f3f7fd] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">客戶見證</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-sky-800 sm:text-4xl">客戶見證</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              這裡放的是低調真實的回饋示意，不誇張，但能看出我們的溝通方式。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {testimonials.slice(0, 2).map((item, index) => (
            <Reveal key={item.profile} delay={index * 100}>
              <article className="rounded-[28px] bg-gradient-to-br from-sky-100 to-sky-200 p-6 shadow-[0_18px_48px_rgba(37,99,235,0.12)]">
                <div className="flex items-start gap-4 border-b border-sky-300/70 pb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-sky-700 text-lg font-black text-white shadow-soft">
                    將
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-sky-900">{item.title}</p>
                    <p className="mt-1 text-sm font-medium text-sky-700">
                      {item.profile}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
                  <p>{item.intro}</p>
                  {item.details.map((detail) => (
                    <p key={detail}>● {detail}</p>
                  ))}
                </div>

                <div className="mt-5">
                  <a
                    href="#contact"
                    onClick={() => trackCtaClick(`testimonial_${index + 1}`)}
                    className="inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                  >
                    {item.cta}
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">常見客戶關注重點</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['不懂流程也可先詢問', '可先了解再決定', '條件由專人協助評估', '不必一次看懂所有方案'].map((tag) => (
                <span key={tag} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">先把常見疑問講明白，客戶會更容易放心，也更容易把資料留下來。</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading eyebrow="Solutions" title="我們可協助的資金方案" desc="依照不同資金用途與條件，協助整理更貼近你的方向。" tone="light" />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 65}>
                <article className="group surface-card rounded-2xl p-6 transition hover:-translate-y-1 hover:border-sky-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">可先評估</p>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <IconWrap className="border-sky-100 bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </IconWrap>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.desc}</p>
                  <div className="mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                  <p className="mt-4 text-sm font-semibold text-sky-700 opacity-90 transition group-hover:opacity-100">
                    先了解是否符合你的條件
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="bg-[#081222] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading eyebrow="Process" title="申請流程" desc="結構清楚、步驟簡單，讓使用者一眼知道接下來會發生什麼。" tone="dark" />
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {processSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.step} delay={index * 70}>
                <article className="surface-dark rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold tracking-[0.3em] text-amber-300">{item.step}</span>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      第 {index + 1} 步
                    </div>
                  </div>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                    <Icon className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.desc}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LeadCaptureSection() {
  const [form, setForm] = useState<LeadFormValues>(formInitialState);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const setField = (key: keyof LeadFormValues, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus('idle');
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof LeadFormValues, string>> = {};
    const name = form.name.trim();
    const phone = form.phone.trim();
    const amount = form.amount.trim();

    if (!name) nextErrors.name = '請輸入姓名';
    if (!phone) {
      nextErrors.phone = '請輸入可聯絡電話';
    } else if (!/^[0-9+\-()\s]{8,}$/.test(phone)) {
      nextErrors.phone = '請輸入正確電話格式';
    }
    if (!amount) nextErrors.amount = '請選擇資金需求';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setStatus('error');
      setMessage('請先完成必填欄位');
      return;
    }

    setStatus('loading');
    setMessage('正在送出...');

    try {
      const result = await submitLead({
        ...form,
        occupation: form.occupation || 'landing-page',
        notes: form.notes,
      });
      setStatus('success');
      setMessage(result.message);
      setForm(formInitialState);
      setErrors({});
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '送出失敗，請稍後再試');
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-1/3 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <Reveal>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-slate-100 bg-gradient-to-br from-[#081222] via-[#0b1730] to-[#102a52] p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-5 lg:p-6">
              <div className="absolute inset-0 opacity-50">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.30),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(212,169,76,0.22),transparent_28%)]" />
                <div className="section-grid absolute inset-0 opacity-15" />
              </div>

              <div className="relative flex h-full flex-col">
                <div className="flex flex-wrap gap-2">
                  {['流程簡單', '審核快速', '專人協助'].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-white/85">
                      {item}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.34em] text-amber-300">Lead Form / Process</p>
                <h2 className="mt-2 max-w-xl text-[2rem] font-black leading-[1.15] tracking-tight sm:text-3xl">
                  先把流程看懂，表單就會好填很多
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                  留下資料後，表單會直接寄到你的 Gmail，方便你即時跟進。先理解步驟，再送出資料，整個過程會更有把握。
                </p>

                <div className="mt-5 rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold tracking-[0.28em] text-amber-300">申請流程</p>
                      <h3 className="mt-2 text-[1.35rem] font-black leading-tight text-white sm:text-2xl">四步驟完成，先看懂再開始</h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold text-slate-200">
                      只需要 1 分鐘先看懂
                    </div>
                  </div>

                  <div className="relative mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1b34]/80 p-4">
                    <div className="pointer-events-none absolute inset-x-6 top-[28px] hidden h-px bg-gradient-to-r from-sky-400 via-amber-300 to-sky-500 lg:block" />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-3">
                      {processSteps.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.step} className="relative">
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-glow">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-[13px] font-black text-[#081222]">
                                {index + 1}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div>
                                <p className="text-[13px] font-black text-white">{item.title}</p>
                                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400">{item.step}</p>
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-bold tracking-[0.22em] text-slate-200">
                                {index === 0 ? '開始' : index === 1 ? '評估' : index === 2 ? '媒合' : '完成'}
                              </span>
                            </div>
                            <p className="mt-2 text-[12px] leading-6 text-slate-300">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {['快速回覆', '流程透明', '資料保密'].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                        <p className="text-[11px] font-bold tracking-[0.24em] text-amber-300">{item}</p>
                        <p className="mt-1 text-[12px] leading-5 text-slate-300">
                          {item === '快速回覆' ? '先看到資料，回覆更快。' : item === '流程透明' ? '每一步都先講明白。' : '資料只用於聯繫與評估。'}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-[22px] border border-amber-300/20 bg-amber-300/10 p-3.5">
                    <p className="text-sm font-semibold text-amber-200">小提醒</p>
                    <p className="mt-1.5 text-[12px] leading-6 text-slate-200">
                      表單送出後會直接寄到 Gmail。若你想先聊聊，也可以直接透過 LINE 先詢問。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="surface-card flex h-full rounded-[32px] p-4">
              <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col rounded-[28px] bg-[#f8fbff] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">立即送出</p>
                    <h3 className="mt-2 text-[1.35rem] font-black leading-tight text-slate-900 sm:text-2xl">留下資料，專人盡快與你聯繫</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">安心填寫</span>
                </div>

                {status === 'success' ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
                {status === 'error' && message ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

                <div className="mt-4 grid gap-3.5">
                  <FieldLabel
                    label="姓名"
                    required
                    error={errors.name}
                    input={
                      <input
                        value={form.name}
                        onChange={(event) => setField('name', event.target.value)}
                        type="text"
                        placeholder="請輸入您的姓名"
                        autoComplete="name"
                        required
                        className={inputClass}
                      />
                    }
                  />

                  <FieldLabel
                    label="電話"
                    required
                    error={errors.phone}
                    input={
                      <input
                        value={form.phone}
                        onChange={(event) => setField('phone', event.target.value)}
                        type="tel"
                        placeholder="請輸入可聯絡電話"
                        autoComplete="tel"
                        required
                        className={inputClass}
                      />
                    }
                  />

                  <FieldLabel
                    label="LINE ID"
                    note="選填"
                    input={
                      <input
                        value={form.lineId}
                        onChange={(event) => setField('lineId', event.target.value)}
                        type="text"
                        placeholder="方便專人快速聯繫"
                        className={inputClass}
                      />
                    }
                  />

                  <FieldLabel
                    label="資金需求"
                    required
                    error={errors.amount}
                    input={
                      <select value={form.amount} onChange={(event) => setField('amount', event.target.value)} required className={inputClass}>
                        <option value="">例如 10萬 / 30萬 / 週轉需求</option>
                        <option value="10萬以下">10 萬以下</option>
                        <option value="10萬 - 30萬">10 萬 - 30 萬</option>
                        <option value="30萬 - 50萬">30 萬 - 50 萬</option>
                        <option value="50萬 - 100萬">50 萬 - 100 萬</option>
                        <option value="100萬以上">100 萬以上</option>
                        <option value="還不確定">還不確定，先幫我評估</option>
                      </select>
                    }
                  />

                  <FieldLabel
                    label="備註"
                    note="選填"
                    input={
                      <textarea
                        value={form.notes}
                        onChange={(event) => setField('notes', event.target.value)}
                        rows={4}
                        placeholder="例如：想了解整合負債、創業資金、短期週轉等"
                        className={cn(inputClass, 'min-h-[120px] resize-none')}
                      />
                    }
                  />
                </div>

                <div className="mt-auto pt-5">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={cn(buttonStyles.form, 'w-full', status === 'loading' && 'cursor-wait opacity-80')}
                  >
                    {status === 'loading' ? '送出中...' : '立即免費諮詢'}
                  </button>

                  <p className="mt-3 text-[11px] leading-6 text-slate-500">資料僅供方案評估使用，將嚴格保密。</p>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="常見問題" desc="把常見疑問先說清楚，能降低猶豫，也更容易讓使用者留下資料。" tone="light" />
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map((item, index) => {
            const open = openIndex === index;
            return (
              <Reveal key={item.q} delay={index * 50}>
                <div className="surface-card overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-bold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <span>{item.q}</span>
                    <span className={cn('text-2xl font-light text-sky-700 transition-transform duration-300', open && 'rotate-45')}>
                      +
                    </span>
                  </button>
                  <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <div className="overflow-hidden px-5 pb-5">
                      <p className="text-sm leading-7 text-slate-600">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = [
    { label: 'Gmail', href: 'mailto:service@gmail.com', icon: GmailFooterIcon },
    { label: 'LINE', href: brand.lineHref, icon: LineFooterIcon },
    { label: 'AI 客服', href: '#contact', icon: AiFooterIcon },
  ];

  return (
    <footer className="bg-[#2f2f33] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <div>
            <h2 className="text-xl font-medium tracking-wide text-slate-100">聯絡我們</h2>
            <div className="mt-5 h-px w-full bg-white/15" />
            <div className="mt-5 flex flex-wrap gap-3">
              {footerLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition group-hover:bg-white/15">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
            <div className="mt-5 space-y-2 text-sm leading-8 text-slate-300">
              <p>服務方式：Gmail / LINE / 網站 AI 客服</p>
              <p>服務內容：貸款諮詢、方案整理、條件評估</p>
              <p>資料處理：僅供聯繫與評估用途，將依流程保密處理</p>
              <p>品牌名稱：{brand.name}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium tracking-wide text-slate-100">著作權聲明</h2>
            <div className="mt-5 h-px w-full bg-white/15" />
            <div className="mt-5 space-y-3 text-sm leading-8 text-slate-300">
              <p>本網站內容為 {brand.name} 所有，未經授權不得擷取、轉載或另作商業使用。</p>
              <p>網站資訊僅供參考，實際可承作條件、額度與流程仍以專人評估後說明為準。</p>
              <p>若您想進一步了解方案，請先透過上方表單留下資料，我們會盡快回覆。</p>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-slate-400/80" />
                <span>貸款權益說明與相關規範，請以實際審核結果為準。</span>
              </div>
              <div className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-slate-400/80" />
                <span>法務顧問：依法規與合約條款辦理，請先完整閱讀。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FloatingContactWidget() {
  const [open, setOpen] = useState(true);
  const items = [
    {
      label: 'AI 客服',
      href: aiServiceUrl,
      onClick: () => trackCtaClick('floating_ai'),
      icon: AiChatIcon,
    },
    {
      label: '官方 LINE',
      href: brand.lineHref,
      onClick: () => trackLineClick('floating_line'),
      icon: LineChatIcon,
    },
    {
      label: '立即聯絡',
      href: '#contact',
      onClick: () => trackCtaClick('floating_contact'),
      icon: PhoneBadgeIcon,
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden lg:block">
      {open ? (
        <div className="w-[18rem] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.26em] text-sky-700">快速聯絡</p>
              <p className="mt-1 text-[12px] font-semibold text-slate-900">點一下就能直接聯繫</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100"
            >
              收合
            </button>
          </div>

          <div className="px-3 py-3">
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={item.onClick}
                    className="group flex flex-col items-center gap-2 rounded-[18px] border border-slate-100 bg-[#f8fbff] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-glow transition group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-black leading-4 text-slate-900">{item.label}</span>
                  </a>
                );
              })}
            </div>
            <div className="mt-3 rounded-[16px] bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
              可先點 AI 客服、官方 LINE 或直接聯絡，快速進入下一步。
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-glow">
            <AiChatIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-black text-slate-900">快速聯絡</span>
        </button>
      )}
    </div>
  );
}

function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 px-3 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur-md sm:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2">
        <a href={aiServiceUrl} onClick={() => trackCtaClick('mobile_ai')} className="rounded-2xl brand-gradient px-3 py-3 text-center text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 active:translate-y-0">
          AI 客服
        </a>
        <a href={brand.lineHref} onClick={() => trackLineClick('mobile_line')} className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3 text-center text-sm font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100 active:translate-y-0">
          官方 LINE
        </a>
        <a href="#contact" onClick={() => trackCtaClick('mobile_apply')} className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-center text-sm font-bold text-amber-800 transition hover:-translate-y-0.5 hover:bg-amber-100 active:translate-y-0">
          立即申請
        </a>
      </div>
    </div>
  );
}

function FloatingBadge({ className, title, text }: { className?: string; title: string; text: string }) {
  return (
    <div className={cn('absolute w-44 rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-soft backdrop-blur-md', className)}>
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-200">{text}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function CreditLoanSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">信用貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您信用貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                先把常見情況拆開看，能更快知道自己目前適合哪一種方向，也比較容易判斷下一步要不要往下走。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {creditLoanImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white px-5 py-4">
                    <div className="inline-flex rounded-full bg-sky-700 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white">
                      服務項目
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#credit-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="credit-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1680px] gap-10 lg:grid-cols-[1.28fr_0.72fr] lg:items-stretch">
          <Reveal>
            <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-[#f8fbff] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <div className="relative flex-[0.82] overflow-hidden rounded-[28px] bg-[#eef4fb]">
                <img
                  src="/credit-report-left.jpg"
                  alt="瞭解信用貸款"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_32%,rgba(8,18,34,0.12)_100%)]" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-black tracking-[0.24em] text-sky-700 shadow-soft backdrop-blur">
                  信用貸款
                </div>
              </div>
              <div className="mt-4 flex flex-1 flex-col rounded-[26px] border border-sky-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">信用貸款常見觀察點</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: '月薪22倍', label: '常見概念' },
                    { value: '負債比率', label: '先看壓力' },
                    { value: '聯徵次數', label: '影響評估' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-sky-100 bg-[#f8fbff] px-4 py-3 text-slate-900">
                      <p className="text-sm font-black text-sky-700">{item.value}</p>
                      <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {['收入證明', '信用空白', '動用卡循'].map((item) => (
                    <div key={item} className="rounded-2xl bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 p-4">
                  <p className="text-sm font-bold text-sky-800">寬版說明</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    如果你是上班族、自營者，或剛換工作，先把收入、負債與聯徵狀況整理好，
                    會比只看利率更接近實際可行的方向。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="surface-card flex h-full min-h-full flex-col rounded-[32px] p-6 sm:p-8">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解信用貸款</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解信用貸款，再決定要不要申請</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                信用貸款多半是以個人信用、收入與整體條件作評估，不一定需要抵押品。看懂月付、負債比和聯徵紀錄，
                會比只看單一利率更接近實際狀況。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {creditLoanFactors.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
                    <p className="text-sm font-bold text-sky-700">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                <p className="text-sm font-bold text-sky-800">如何提高信用貸款成功率</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                    先把收入、固定支出與既有負債整理清楚，避免條件說不完整。
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                    不要只看月付金額，也要把總還款與手續成本一起看。
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                    若近期有卡循、預借現金或多次查詢，建議先讓專人看整體條件。
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#contact" onClick={() => trackCtaClick('credit_report_contact')} className={buttonStyles.primary}>
                  立即了解方案
                </a>
                <a href={brand.lineHref} onClick={() => trackLineClick('credit_report_line')} className={buttonStyles.secondary}>
                  馬上加入 LINE
                </a>
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-500">點擊了解更多，可直接看這份報導與整理後的重點說明。</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function DebtConsolidationSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">整合負債問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">誰適合申整合負債</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                如果你現在的月付分散、帳單很多、壓力越來越重，可以先看這些典型情況，判斷自己是不是屬於適合整理的一群。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {debtConsolidationImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white px-5 py-4">
                    <div className="inline-flex rounded-full bg-sky-700 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white">
                      服務項目
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#debt-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="debt-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-stretch">
          <Reveal>
            <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-[#f8fbff] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                <img
                  src={buildServiceCardArt('理債', '瞭解整合負債', '先理解整合負債，再決定要不要往下')}
                  alt="瞭解整合負債"
                  className="h-full min-h-[420px] w-full rounded-[26px] object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="surface-card flex h-full flex-col rounded-[32px] p-6 sm:p-8">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解整合負債</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解整合負債，再決定要不要往下</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                整合負債是把多筆債務重新整理成一筆或較少筆的月付結構，讓管理更清楚。重點不是只看利率，
                而是要一起看原本壓力、月付總額、年限與整體成本。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {debtConsolidationFactors.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
                    <p className="text-sm font-bold text-sky-700">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                <p className="text-sm font-bold text-sky-800">什麼時候需要整合負債？</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  如果你發現卡費、信貸、分期和其他帳單已經把收入切得太碎，或是每月要繳的日子很多、常常怕漏繳，
                  就可以先考慮把負債整理起來。常見觀察點包括負債比、聯徵次數、信用使用習慣與收入穩定度。
                </p>
              </div>

              <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-sky-800">整合負債的好處</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    '一筆負債一條線',
                    '免除信用卡高額循環',
                    '約可降低月付壓力',
                    '提升每月可支配所得',
                    '繳款年限可重排',
                    '統一繳款日',
                    '不會影響信用分數？',
                    '穩定繳款、還能提升信用',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-sm font-black text-sky-700">✓</span>
                      <span className="text-sm font-semibold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#contact" onClick={() => trackCtaClick('debt_report_contact')} className={buttonStyles.primary}>
                  立即了解方案
                </a>
                <a href={brand.lineHref} onClick={() => trackLineClick('debt_report_line')} className={buttonStyles.secondary}>
                  馬上加入 LINE
                </a>
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-500">點擊了解更多，可直接看這份報導與整理後的重點說明。</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function MortgageSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">房屋貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您房屋貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                從屋齡、權屬、貸款比到申請狀況，先把常見的卡點拆開來看，會更容易知道下一步該從哪裡開始。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mortgageImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white px-5 py-4">
                    <div className="inline-flex rounded-full bg-sky-700 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white">
                      服務項目
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#mortgage-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="mortgage-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解房屋貸款</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解房屋貸款，再決定要不要往下</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                房屋貸款是以房屋作為擔保品來進行借貸。依照房屋是否還有貸款，通常可分為一胎房貸、房屋增貸與二胎房貸。
                相較於沒有擔保品的方案，房屋類型更需要看懂房屋殘值、貸款順位、年限與利率差異。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {mortgageWays.map((item, index) => {
               const wayImages = [
                 buildServiceCardArt('房屋', '一胎房貸', '在房屋本身沒有任何貸款的情況下申請。'),
                 buildServiceCardArt('房屋', '房屋增貸', '房貸已繳一段時間後，依殘值再申請資金。'),
                 buildServiceCardArt('房屋', '二胎房貸', '已有第一順位抵押，再做第二順位規劃。'),
               ];
              return (
                <Reveal key={item.title} delay={index * 60}>
                  <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#f8fbff] shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                    <img src={wayImages[index]} alt={item.title} className="h-48 w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                    <div className="p-5">
                      <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <div className="surface-card flex h-full flex-col rounded-[28px] p-6 sm:p-8">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">房屋增貸 / 二胎房貸的條件</p>
                <ul className="mt-5 space-y-4">
                  {mortgageFactors.map((item) => (
                    <li key={item.label} className="flex items-start gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-600 text-[11px] font-black text-white">•</span>
                      <p className="text-sm leading-7 text-slate-700">
                        <span className="font-bold text-slate-900">{item.label}：</span>
                        {item.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="surface-card rounded-[28px] p-6 sm:p-8">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">房屋增貸 / 二胎房貸的利率與額度</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        <th className="border-b border-slate-200 bg-[#2f2f33] px-4 py-3 text-white">項目</th>
                        <th className="border-b border-slate-200 bg-[#0e68b3] px-4 py-3 text-white">銀行</th>
                        <th className="border-b border-slate-200 bg-[#96b500] px-4 py-3 text-white">融資公司</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mortgageComparisonRows.map(([item, bank, company]) => (
                        <tr key={item} className="odd:bg-white even:bg-slate-50">
                          <td className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">{item}</td>
                          <td className="border-b border-slate-200 px-4 py-3 leading-7 text-slate-700">{bank}</td>
                          <td className="border-b border-slate-200 px-4 py-3 leading-7 text-slate-700">{company}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  不同機構有不同的核貸條件，若你在申請房屋貸款時遇到困難，可尋求專人協助，先分析你的財務與信用狀況。
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function CarLoanSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">汽車貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您汽車貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                當你需要買車找錢、原車融資或汽車增貸時，可以先看看自己屬於哪一種情境，再決定下一步要怎麼整理。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {carLoanImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white px-5 py-4">
                    <div className="inline-flex rounded-full bg-sky-700 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white">
                      服務項目
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#car-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="car-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-stretch">
          <Reveal>
            <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-[#f8fbff] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <img
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80"
                alt="瞭解汽車貸款"
                className="h-full min-h-[420px] w-full rounded-[26px] object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="surface-card flex h-full flex-col rounded-[32px] p-6 sm:p-8">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解汽車貸款</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解汽車貸款，再決定要不要往下</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                汽車貸款依你的目的不同，會分為【購車貸款】與【原車融資】二大類，都是以汽車／機車作為擔保品來進行借貸。
                相較於沒有擔保品的貸款，更容易申辦，但金融機構需確認申請人有還款能力，也會參考信用狀況與財務狀況，
                並依此調整核貸利率、金額，以下主要介紹取得資金的【原車融資】。
              </p>

              <div className="mt-6">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">利用汽車取得資金的 3 種方式</p>
                <ul className="mt-4 space-y-3">
                  {carLoanWays.map((item) => (
                    <li key={item.title} className="flex items-start gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-sky-500" />
                      <p className="text-sm leading-7 text-slate-700">
                        <span className="font-bold text-slate-900">{item.title}：</span>
                        {item.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-sky-800">汽車貸款的優勢</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {carLoanBenefits.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-black text-sky-700">✓</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="text-xs leading-5 text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                <p className="text-sm font-bold text-sky-800">買車找錢的詳細說明</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  如果你的目標是「買車找錢」，通常會先看你是要購車貸款，還是要把現有汽車拿來再做資金規劃。
                  購車貸款重點在新車或中古車購置後的付款安排；原車融資則是針對已持有汽車做資金活化，
                  汽車增貸與汽車轉增貸則是依現有貸款條件，重新整理出更適合的月付與額度。
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#contact" onClick={() => trackCtaClick('car_report_contact')} className={buttonStyles.primary}>
                  立即了解方案
                </a>
                <a href={brand.lineHref} onClick={() => trackLineClick('car_report_line')} className={buttonStyles.secondary}>
                  馬上加入 LINE
                </a>
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-500">點擊了解更多，可直接看這份報導與整理後的重點說明。</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function DebtNegotiationSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">債務協商問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您債務協商問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                如果目前的還款壓力已經接近臨界點，可以先看看自己是否屬於適合進入協商評估的情境，再決定下一步。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {debtNegotiationImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#debt-negotiation-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="debt-negotiation-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解債務協商</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解債務協商，再決定要不要往下</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                當你的收入無法負擔多筆債務的月付金，整合負債是優先選擇；若條件無法整合負債，
                則可選擇債務協商，讓債務整合至一家債權銀行，可能降低月付並有機會減少債務壓力。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <Reveal>
              <div className="surface-card flex h-full flex-col rounded-[28px] p-6 sm:p-8">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">債務協商的二種類別</p>
                <div className="mt-6 grid gap-4">
                  {debtNegotiationTypes.map((item, index) => (
                    <article key={item.title} className="overflow-hidden rounded-[24px] border border-slate-100 bg-[#f8fbff] shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                      <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
                        <div className="p-5">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-black text-sky-700">
                              0{index + 1}
                            </span>
                            <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                          </div>
                          <p className="mt-4 text-sm leading-7 text-slate-600">{item.desc}</p>
                        </div>
                        <div className="bg-white p-5 md:border-l md:border-slate-100">
                          <div className="rounded-2xl bg-sky-50 p-4">
                            <p className="text-xs font-bold tracking-[0.24em] text-sky-700">整理重點</p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">
                              先看你目前的債務分布、收入結構與還款壓力，再判斷比較適合哪一種協商方式。
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>

          <Reveal delay={80}>
            <div className="surface-card flex h-full flex-col rounded-[28px] p-6 sm:p-8">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">債務協商的注意事項</p>
                <ul className="mt-5 space-y-3">
                  {debtNegotiationNotes.map((note) => (
                    <li key={note} className="flex items-start gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-sky-500" />
                      <p className="text-sm leading-7 text-slate-700">{note}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                  <p className="text-sm font-bold text-sky-800">債務協商 vs 整合負債</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    如果還有能力負擔債務，通常會優先考慮整合負債；若已經無法整合負債，才會考慮債務協商。
                    兩者都需要先看清楚收入、負債、聯徵與還款壓力，並不是有壓力就一定直接進協商。
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function BusinessLoanSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">企業貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您企業貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                公司營運、專案支出、轉型升級或資金周轉時，都可以先看一下自己是不是屬於適合企業貸款評估的情境。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessLoanImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#business-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="business-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解企業貸款</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解企業貸款，再決定要不要往下</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                企業為了營運、轉型、升級需要資金時，可以向公司名義銀行等金融機構申請企業貸款。
                企業貸款資料較多，通常銀行會看公司資本額、資產負債、稅務報表、401 報表、帳戶出入明細與貸款目的。
                若中小企業因為專業財務人員不足，也可先把資料整理清楚再進行評估。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <Reveal>
              <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-[#f8fbff] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                <img
                  src={buildServiceCardArt('企業', '瞭解企業貸款', '先理解企業貸款，再決定要不要往下')}
                  alt="瞭解企業貸款"
                  className="h-full min-h-[520px] w-full rounded-[26px] object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="surface-card rounded-[28px] p-6 sm:p-8">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">近期六種政策貸款摘要</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {businessLoanOverview.map((item) => (
                    <article key={item.title} className="rounded-[24px] border border-slate-100 bg-[#f8fbff] p-4 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
                      <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                      <ul className="mt-3 space-y-2">
                        {item.desc.map((line) => (
                          <li key={line} className="flex items-start gap-2 text-sm leading-7 text-slate-700">
                            <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>

                <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                  <p className="text-sm font-bold text-sky-800">企業貸款的注意事項</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {businessLoanNotes.map((note) => (
                      <li key={note} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#contact" onClick={() => trackCtaClick('business_report_contact')} className={buttonStyles.primary}>
                    立即了解方案
                  </a>
                  <a href={brand.lineHref} onClick={() => trackLineClick('business_report_line')} className={buttonStyles.secondary}>
                    馬上加入 LINE
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductLoanSpecialSections() {
  const summaryItems = [
    { label: '貸款性質', value: '融資公司信用貸款，無需抵押品' },
    { label: '額度與期數', value: '約 5 - 45 萬元，最高可達 100 萬，分期可達 42 期' },
    { label: '利率', value: '年利率約 12% - 15%，需留意是否超過法定上限 16%' },
    { label: '適用對象', value: '銀行信用瑕疵、無薪資證明、急需週轉者' },
    { label: '申請條件', value: '年滿 18 歲，有穩定收入' },
  ];

  const featureItems = [
    {
      title: '無須實體購買',
      desc: '通常是以購買商品名義申請，實際上是把資金用途包裝成分期安排，不需要真的先取得商品。',
    },
    {
      title: '不查銀行聯徵',
      desc: '即使過去有銀行往來狀況、信用瑕疵或信用卡使用不穩，仍有可能由融資公司進一步評估。',
    },
    {
      title: '審核速度快',
      desc: '流程通常比銀行信貸更快，若文件齊全，常見可在較短時間內得到結果。',
    },
    {
      title: '需注意風險',
      desc: '相較銀行信貸，商品貸款利息與相關費用通常較高，也可能有代辦費或服務費，申請前要先看清楚。',
    },
  ];

  const noticeItems = [
    '留意利率是否高於 16% 或需先收費的公司。',
    '還款期數雖然較彈性，但利息可能累積較高，應先評估整體還款能力。',
    '若條件本來就不錯，仍要比較是否有更低成本的替代方案。',
  ];

  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">商品貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您商品貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                當你要採購貨品、更新設備或支付專案款項時，先把用途與付款節奏整理好，會比直接看單一期數更容易判斷是否合適。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productLoanImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#product-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="product-report" className="bg-[#151923] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-amber-300">商品貸款說明</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">商品貸款（萬物貸）完整說明</h2>
              <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                商品貸款（又稱「萬物貸」）是一種以購買商品名義申請的「無擔保」分期信用貸款，主要由融資公司承作。
                其額度約 5 萬至 45 萬元，甚至可達 100 萬元，因審核不看銀行聯徵紀錄，利率約 12% - 16%（需符合合法利率），
                適合急需資金或信用瑕疵者，最快 2 - 4 天撥款。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-7">
            <Reveal>
              <p className="text-sm font-bold tracking-[0.28em] text-amber-300">商品貸款關鍵資訊總覽</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {summaryItems.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-semibold tracking-[0.24em] text-slate-300">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="mt-8 grid gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
                <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-[#1b2130] p-5 sm:p-6">
                  <p className="text-sm font-bold tracking-[0.28em] text-amber-300">商品貸款的特色與風險</p>
                  <div className="mt-5 space-y-4">
                    {featureItems.map((item, index) => (
                      <div key={item.title} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-sm font-black text-amber-300">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-base font-black text-white">{item.title}</p>
                            <p className="mt-1 text-sm leading-7 text-slate-300">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-[#1b2130] p-5 sm:p-6">
                  <p className="text-sm font-bold tracking-[0.28em] text-amber-300">注意事項</p>
                  <div className="mt-5 space-y-3">
                    {noticeItems.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300" />
                        <p className="text-sm leading-7 text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4">
                    <p className="text-sm font-bold text-amber-200">商品貸款小提醒</p>
                    <p className="mt-2 text-sm leading-7 text-slate-200">
                      如果你手上已有報價單、合約或採購內容，先整理出完整資料會更快知道適不適合。
                      不要只看月付，也要把費用、期數與用途一起對齊。
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#contact"
                      onClick={() => trackCtaClick('product_report_contact')}
                      className={cn(buttonStyles.primary, 'border-0 bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 text-white')}
                    >
                      立即了解方案
                    </a>
                    <a href={brand.lineHref} onClick={() => trackLineClick('product_report_line')} className={buttonStyles.heroSecondary}>
                      馬上加入 LINE
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function MobileLoanSpecialSections() {
  const comparisonRows = [
    {
      label: '申辦方式',
      items: [
        '手機作為擔保品借款，銀行、部分融資公司、當舖都有提供',
        '撥打電話或透過實體窗口諮詢，向銀行申請',
        '銀行與電信公司的合作，以手機繳款紀錄評估信用的借款方式',
      ],
    },
    {
      label: '優點',
      items: [
        '申請門檻低，申請快速，不會調閱聯徵',
        '利率相對較低且安全',
        '申請方便快速獲得資金',
      ],
    },
    {
      label: '缺點',
      items: [
        '民間借款風險較大，無法還款會失去抵押品',
        '申請過程較繁瑣，要求良好信用紀錄，借款額度較低',
        '可能需要預繳金，綁約金額固定，合約未到期前中止可能衍生額外違約金',
      ],
    },
    {
      label: '適合對象',
      items: [
        '緊急資金周轉金需求，信用評分不足遭銀行拒絕',
        '緊急資金需求且信用狀態良好',
        '信用小白、低利率貸款需求、想要透過繳約貸款不用新空機的顧客',
      ],
    },
  ];

  const alerts = [
    '手機貸款多半屬於小額、短期資金安排，重點是先補缺口，再評估後續規劃。',
    '務必選擇合法業者，切勿提供手機 Apple ID 密碼或帳號，避免遭到詐騙。',
    '雖然手機貸款好過件，但利率通常高於銀行信貸，申辦前請先衡量還款能力。',
  ];

  const methodCards = [
    {
      title: '手機抵押借款',
      summary: '以手機本體或購機憑證作為擔保，適合急件周轉。',
      highlight: '申請快',
    },
    {
      title: '手機信用貸款',
      summary: '以個人條件、工作與信用狀況評估，通常不需留機。',
      highlight: '利率較穩定',
    },
    {
      title: '手機門號貸款',
      summary: '以門號繳款紀錄、使用狀況做為參考，核准重點更彈性。',
      highlight: '門檻較低',
    },
  ];

  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">手機貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您手機貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                手機貸款多半是較小額、較短期的資金安排，重點在於先把短期缺口補起來，再決定後續要怎麼處理。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mobileLoanImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#mobile-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="mobile-report" className="bg-gradient-to-b from-[#f7fbff] via-white to-[#eef5ff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-[#9b7a4b]">手機貸款方法介紹</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">手機貸款方法比較</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                以手機相關條件作為評估基礎，常見可分成三種方式。先看懂差異，再選擇最適合自己的方案。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 rounded-[34px] border border-[#dce8ff] bg-white p-4 shadow-[0_24px_80px_rgba(37,99,235,0.10)] sm:p-6 lg:p-7">
            <Reveal>
              <div className="overflow-hidden rounded-[30px] border border-[#dce8ff] bg-white">
                <div className="grid grid-cols-[0.9fr_1.35fr_1.35fr_1.35fr] bg-gradient-to-r from-sky-700 via-blue-700 to-sky-800 text-white">
                  <div className="flex items-center justify-center px-4 py-5 text-center">
                    <div className="text-4xl">📱</div>
                  </div>
                  {methodCards.map((method) => (
                    <div key={method.title} className="px-4 py-5 text-center">
                      <div className="text-2xl font-black tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.18)]">
                        {method.title}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-dashed divide-[#d7e3ff] bg-[#fbfdff] text-slate-800">
                  {comparisonRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[0.9fr_1.35fr_1.35fr_1.35fr]">
                      <div className="flex items-center justify-center bg-gradient-to-b from-blue-600 to-sky-700 px-4 py-7 text-center text-lg font-black text-white">
                        {row.label}
                      </div>
                      {row.items.map((item) => (
                        <div
                          key={item}
                          className="border-l border-dashed border-[#d7e3ff] px-5 py-6 text-sm leading-8 text-slate-700 sm:text-[15px]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <Reveal delay={60}>
                <div className="rounded-[28px] border border-[#dce8ff] bg-white px-6 py-5 shadow-[0_14px_40px_rgba(37,99,235,0.08)]">
                  <p className="text-sm font-bold tracking-[0.28em] text-sky-700">手機貸款關鍵資訊總覽</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {methodCards.map((method) => (
                      <div key={method.title} className="rounded-[20px] border border-[#dce8ff] bg-[#f7fbff] p-4">
                        <div className="text-sm font-black text-sky-700">{method.highlight}</div>
                        <div className="mt-2 text-sm leading-7 text-slate-700">{method.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="rounded-[28px] border border-[#dce8ff] bg-[#f4f8ff] px-6 py-5 shadow-[0_14px_40px_rgba(37,99,235,0.08)]">
                  <p className="text-sm font-bold tracking-[0.28em] text-sky-700">注意事項</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {alerts.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#contact"
                      onClick={() => trackCtaClick('mobile_report_contact')}
                      className={cn(buttonStyles.primary, 'border-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white')}
                    >
                      立即了解方案
                    </a>
                    <a
                      href={brand.lineHref}
                      onClick={() => trackLineClick('mobile_report_line')}
                      className={buttonStyles.heroSecondary}
                    >
                      馬上加入 LINE
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ScooterLoanSpecialSections() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-[0.36em] text-sky-700">機車貸款問題</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">解決您機車貸款問題</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                機車貸款通常適合小額週轉或短期安排，先看車齡、車況與權屬資料，再判斷是不是適合你目前的需求。
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scooterLoanImageCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 50}>
                <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(card.detailTarget ?? '#scooter-report')}
                      className="mt-4 inline-flex rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
                    >
                      了解更多
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="scooter-report" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1760px] gap-10 lg:grid-cols-[1.24fr_0.76fr] lg:items-stretch">
          <Reveal>
            <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-[#f8fbff] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <div className="relative flex-[1.05] min-h-[520px] overflow-hidden rounded-[26px]">
                <img
                  src="/motorcycle-report-left-v2.jpg"
                  alt="瞭解機車貸款"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(8,18,34,0.08)_100%)]" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-black tracking-[0.24em] text-sky-700 shadow-soft backdrop-blur">
                  機車貸款
                </div>
              </div>
              <div className="mt-4 flex flex-1 flex-col rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">機車貸款常見觀察點</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: '小額', label: '週轉靈活' },
                    { value: '快', label: '評估速度' },
                    { value: '保留', label: '通勤使用' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-sky-100 bg-[#f8fbff] px-4 py-3 text-slate-900">
                      <p className="text-sm font-black text-sky-700">{item.value}</p>
                      <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    '看車齡與車況',
                    '先評估可貸方向',
                    '是否保留使用權',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-auto rounded-[22px] border border-sky-100 bg-sky-50 p-4">
                  <p className="text-sm font-bold text-sky-800">寬版說明</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    如果你還需要每天通勤，或想保留機車使用權，先把這點說明清楚會更重要。
                    先看車況、車齡與可貸方向，再來整理是否適合你目前的需求。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="surface-card flex h-full flex-col rounded-[32px] p-6 sm:p-8">
              <p className="text-sm font-bold tracking-[0.28em] text-sky-700">瞭解機車貸款</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">先理解機車貸款，再決定要不要往下</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                機車貸款是以機車作為資金規劃的一種方式，常見於小額週轉或短期需求。
                這類方案雖然比較靈活，但仍會看車齡、車況、權屬資料與你是否還要保留通勤使用。
              </p>

              <div className="mt-6">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">機車貸款常見用途</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {scooterLoanUses.map((item) => (
                    <div key={item.title} className="rounded-2xl bg-[#f8fbff] p-4">
                      <p className="text-sm font-black text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-sky-800">機車貸款的評估重點</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scooterLoanFactors.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-[#f8fbff] px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                <p className="text-sm font-bold text-sky-800">機車貸款小提醒</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  如果你還要每天通勤，或不想影響機車使用方式，先把這點說清楚很重要。
                  方案差異通常會落在車況、資料與後續安排，而不是只有看名下有沒有車。
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <a href="#contact" onClick={() => trackCtaClick('scooter_report_contact')} className={buttonStyles.primary}>
                  立即了解方案
                </a>
                <a href={brand.lineHref} onClick={() => trackLineClick('scooter_report_line')} className={buttonStyles.secondary}>
                  馬上加入 LINE
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ServiceDetailPage({ service }: { service: ServiceDetail }) {
  const page = getServicePageConfig(service);
  const relatedServices = serviceDetails.filter((item) => item.path !== service.path).slice(0, 6);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc] text-slate-900">
      <Header />
      <main className="pt-0">
        <section className="relative overflow-hidden bg-[#081222] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_28%),radial-gradient(circle_at_80%_18%,_rgba(212,169,76,0.16),_transparent_24%),linear-gradient(180deg,_rgba(12,20,36,0.96)_0%,_rgba(8,18,34,1)_100%)]" />
          <div className="absolute inset-0 section-grid opacity-20" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-amber-300">服務項目 / {service.subtitle}</p>
              <h1 className="mt-4 text-[2.4rem] font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {service.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                {service.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#contact" onClick={() => trackCtaClick(`service_detail_contact_${service.anchorId}`)} className={buttonStyles.heroPrimary}>
                  立即免費諮詢
                </a>
                <a href={brand.lineHref} onClick={() => trackLineClick(`service_detail_line_${service.anchorId}`)} className={buttonStyles.heroSecondary}>
                  馬上加入 LINE
                </a>
                <button
                  type="button"
                  onClick={() => navigateTo('/#services')}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  回到服務列表
                </button>
              </div>
            </div>
          </div>
        </section>

        {service.title === '信用貸款' ? <CreditLoanSpecialSections /> : null}
        {service.title === '整合負債' ? <DebtConsolidationSpecialSections /> : null}
        {service.title === '房屋貸款' ? <MortgageSpecialSections /> : null}
        {service.title === '汽車貸款' ? <CarLoanSpecialSections /> : null}
        {service.title === '債務協商' ? <DebtNegotiationSpecialSections /> : null}
        {service.title === '企業貸款' ? <BusinessLoanSpecialSections /> : null}
        {service.title === '商品貸款' ? <ProductLoanSpecialSections /> : null}
        {service.title === '手機貸款' ? <MobileLoanSpecialSections /> : null}
        {service.title === '機車貸款' ? <ScooterLoanSpecialSections /> : null}

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch">
            <Reveal>
              <div className="surface-card premium-surface flex h-full overflow-hidden rounded-[32px] p-4 sm:p-5">
                <div className="relative flex min-h-[520px] flex-1 overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#fbfdff_0%,rgba(127,199,255,0.18)_52%,#eef5ff_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_86%_14%,rgba(212,169,76,0.16),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)]" />
                  <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <div className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6 lg:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-sky-100 bg-white/85 px-4 py-2 text-[11px] font-black tracking-[0.26em] text-sky-700 shadow-soft backdrop-blur">
                        專屬方案頁
                      </span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-sky-700">
                        {service.tag}
                      </span>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                      <div className="max-w-xl">
                        <p className="text-xs font-bold uppercase tracking-[0.34em] text-sky-700">{service.subtitle}</p>
                        <h2 className="mt-3 text-[2.45rem] font-black leading-[0.95] tracking-tight text-slate-900 sm:text-[3.1rem]">
                          {service.title}
                        </h2>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">{service.who}</p>

                        <div className="mt-6 flex flex-wrap gap-2.5">
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-soft">
                            先看懂再決定
                          </span>
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-soft">
                            流程透明 · 好理解
                          </span>
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-soft">
                            條件先整理
                          </span>
                        </div>
                      </div>

                      <div className="relative flex min-h-[300px] items-center justify-center rounded-[28px] border border-white/60 bg-white/65 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                        <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(212,169,76,0.12),transparent_26%)]" />
                        <div className="relative grid h-full w-full gap-3">
                          <div className="rounded-[22px] border border-sky-100 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                            <p className="text-[11px] font-bold tracking-[0.26em] text-sky-700">快速回覆</p>
                            <p className="mt-1.5 text-sm leading-6 text-slate-600">先看資料，回覆更快。</p>
                          </div>
                          <div className="rounded-[22px] border border-slate-100 bg-[#f8fbff] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                            <p className="text-[11px] font-bold tracking-[0.26em] text-sky-700">方案重點</p>
                            <p className="mt-1.5 text-sm leading-6 text-slate-600">{service.desc}</p>
                          </div>
                          <div className="rounded-[22px] border border-amber-100 bg-amber-50 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                            <p className="text-[11px] font-bold tracking-[0.26em] text-amber-700">資料保密</p>
                            <p className="mt-1.5 text-sm leading-6 text-slate-600">資料只用於聯繫與評估，不做多餘使用。</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {service.tips.slice(0, 3).map((tip) => (
                        <div key={tip} className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur-sm">
                          <p className="text-xs font-bold tracking-[0.22em] text-sky-700">科普重點</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="surface-card flex h-full flex-col rounded-[32px] p-5 sm:p-7 lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-sky-700">方案科普</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-[2.15rem]">
                  先理解用途，再決定要不要往下
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">{service.note}</p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-bold tracking-[0.22em] text-sky-700">
                    {service.tag}
                  </span>
                  <span className="rounded-full bg-[#f8fbff] px-4 py-2 text-xs font-semibold text-slate-600">
                    {service.subtitle}
                  </span>
                  <span className="rounded-full bg-[#f8fbff] px-4 py-2 text-xs font-semibold text-slate-600">
                    {service.who}
                  </span>
                </div>

                <div className="mt-6 grid flex-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-100 bg-[#f8fbff] p-5">
                    <p className="text-xs font-bold tracking-[0.24em] text-sky-700">適合誰</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{service.who}</p>
                  </div>
                  <div className="rounded-[24px] border border-slate-100 bg-[#f8fbff] p-5">
                    <p className="text-xs font-bold tracking-[0.24em] text-sky-700">方案重點</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{service.desc}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-sky-100 bg-[#f8fbff] p-5">
                  <p className="text-xs font-bold tracking-[0.24em] text-sky-700">科普重點</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {service.tips.map((tip) => (
                      <div
                        key={tip}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
                      >
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-sky-500" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mx-auto mt-6 max-w-7xl">
            <Reveal>
              <div className="surface-card rounded-[32px] p-5 sm:p-7 lg:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold tracking-[0.28em] text-sky-700">FAQ</p>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">這個方案常見問題</h2>
                  </div>
                  <p className="text-sm leading-7 text-slate-500">先看懂規則，再決定要不要往下。</p>
                </div>

                <div className="mt-6 grid gap-3">
                  {page.faq.map((item, index) => {
                    const open = openFaqIndex === index;
                    return (
                      <div
                        key={item.q}
                        className={cn(
                          'overflow-hidden rounded-[24px] border bg-white transition-shadow',
                          open ? 'border-sky-200 shadow-[0_12px_30px_rgba(37,99,235,0.08)]' : 'border-slate-200',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(open ? -1 : index)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <span className="text-base font-semibold text-slate-900 sm:text-lg">{item.q}</span>
                          <span
                            className={cn(
                              'grid h-8 w-8 place-items-center rounded-full bg-sky-50 text-xl font-light text-sky-700 transition-transform duration-200',
                              open && 'rotate-45 bg-sky-100',
                            )}
                          >
                            +
                          </span>
                        </button>
                        <div
                          className={cn(
                            'grid px-5 transition-all duration-300 ease-out',
                            open ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]',
                          )}
                        >
                          <div className="overflow-hidden">
                            <p className="text-sm leading-8 text-slate-600">{item.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mx-auto mt-6 max-w-7xl">
            <Reveal>
              <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-[#0f1b31] px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-amber-300">立即諮詢</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight">{page.ctaTitle}</h2>
                    <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">{page.ctaDesc}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <a href="#contact" onClick={() => trackCtaClick(`service_detail_contact_${service.anchorId}`)} className={buttonStyles.heroPrimary}>
                      立即免費諮詢
                    </a>
                    <a href={brand.lineHref} onClick={() => trackLineClick(`service_detail_line_${service.anchorId}`)} className={buttonStyles.heroSecondary}>
                      馬上加入 LINE
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mx-auto mt-6 max-w-7xl">
            <Reveal delay={80}>
              <div className="surface-card rounded-[32px] p-5 sm:p-7 lg:p-8">
                <p className="text-sm font-bold tracking-[0.28em] text-sky-700">其他方案</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <h2 className="text-2xl font-black text-slate-900">想先看別的方案，也可以直接切換</h2>
                  <p className="hidden text-sm text-slate-500 md:block">每個方案都有自己的獨立頁面。</p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {relatedServices.map((item, index) => (
                    <button
                      key={item.anchorId}
                      type="button"
                      onClick={() => navigateTo(item.path)}
                      className="group flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_32px_rgba(37,99,235,0.08)]"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900 transition group-hover:text-sky-700">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                      </div>
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-50 text-xs font-black text-sky-700 transition group-hover:bg-sky-100">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
        <FloatingContactWidget />
        <MobileCtaBar />
      </main>
    </div>
  );
}

function App() {
  const pathname = usePathname();
  const activeService = serviceDetails.find((item) => item.path === pathname);

  if (activeService) {
    return <ServiceDetailPage service={activeService} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc] text-slate-900">
      <Header />
      <main className="pt-0">
        <TopMarqueeSection />
        <HeroSection />
        <NeedSection />
        <ArticleSection />
        <LoanCalculatorSection />
        <ReportSection />
        <TrustSection />
        <LeadCaptureSection />
        <FAQSection />
        </main>
        <Footer />
        <FloatingContactWidget />
        <MobileCtaBar />
    </div>
  );
}

export default App;

function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 20 6v6c0 4.97-3.16 8.96-8 11-4.84-2.04-8-6.03-8-11V6l8-3Z" />
      <path d="m9.5 12 1.9 1.9 3.9-3.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayersIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M12 14v2" strokeLinecap="round" />
    </svg>
  );
}

function FlowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h6m-6 10h6m4-10h6m-6 10h6" strokeLinecap="round" />
      <circle cx="10" cy="7" r="2" />
      <circle cx="14" cy="17" r="2" />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StackIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4 4 8l8 4 8-4-8-4Z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16l8 4 8-4" />
    </svg>
  );
}

function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="7" width="16" height="12" rx="2" />
      <path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <path d="M4 12h16" />
    </svg>
  );
}

function GmailFooterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.5 12 13l8-5.5" />
      <path d="M5 7h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <path d="M5 16V8l7 5 7-5v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LineFooterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4l-4 3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="M9 10.5h6M9 13.5h4" strokeLinecap="round" />
    </svg>
  );
}

function AiFooterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4.5 13.8 8l3.5 1.3-3.5 1.2L12 14l-1.8-3.5-3.5-1.2L10.2 8 12 4.5Z" />
      <path d="M5 13.5 6.1 16l2.5.9-2.5.9L5 20.3 3.9 17.8 1.4 16.9l2.5-.9L5 13.5Z" />
      <path d="M17 14.5 17.8 16l1.8.7-1.8.7L17 19l-.8-1.6-1.8-.7 1.8-.7L17 14.5Z" />
    </svg>
  );
}

function SparkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Z" />
      <path d="M19 4v3m-1.5-1.5h3" strokeLinecap="round" />
    </svg>
  );
}

function CreditIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14h3" strokeLinecap="round" />
    </svg>
  );
}

function ShoppingCartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M4 5h2l2.1 9.1a1.8 1.8 0 0 0 1.7 1.4h7.6a1.8 1.8 0 0 0 1.7-1.3L21 8H7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 5h11l-1.2 5.2H10.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 5 8.6 2.8A1.5 1.5 0 0 0 7.2 2H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 11 8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

function CarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 14 7 9h10l2 5" />
      <rect x="4" y="14" width="16" height="5" rx="2" />
      <circle cx="8" cy="19" r="1.5" />
      <circle cx="16" cy="19" r="1.5" />
    </svg>
  );
}

function MotorcycleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="17" r="2.3" />
      <circle cx="17" cy="17" r="2.3" />
      <path d="M9.5 17h3.2l2.2-4h2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 13h-2.3l-1.7-2.8H6.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.7 13.1 18 10.8l1.3 1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10.2h2.3" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="7" y="3.5" width="10" height="17" rx="2.4" />
      <path d="M10 6.8h4" strokeLinecap="round" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BuildingIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h16" strokeLinecap="round" />
      <path d="M6 20V8.5l6-3.5 6 3.5V20" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8.2" y="10" width="1.8" height="2.2" rx="0.4" />
      <rect x="11.1" y="10" width="1.8" height="2.2" rx="0.4" />
      <rect x="14" y="10" width="1.8" height="2.2" rx="0.4" />
      <rect x="8.2" y="13.6" width="1.8" height="2.2" rx="0.4" />
      <rect x="11.1" y="13.6" width="1.8" height="2.2" rx="0.4" />
      <rect x="14" y="13.6" width="1.8" height="2.2" rx="0.4" />
    </svg>
  );
}

function MessageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H8l-4 3V5Z" />
      <path d="M8 9h8M8 12h5" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M7 17v-5" strokeLinecap="round" />
      <path d="M12 17V7" strokeLinecap="round" />
      <path d="M17 17v-8" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="m9.5 12 1.8 1.8 3.8-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AiChatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.8" y="4.2" width="16.4" height="12.8" rx="5" />
      <path d="M8.2 16.8 6.6 19.8l4-2.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.8 11.9h6.2M8.8 8.9h2.8" strokeLinecap="round" />
      <circle cx="16.8" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LineChatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.8" y="4.2" width="16.4" height="12.8" rx="5" />
      <path d="M10.6 18.2 11 16.2l-1.7-1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9.8h8M8 12h4.8" strokeLinecap="round" />
      <path d="M15.4 8.3c.7 0 1.3.6 1.3 1.3v2.5c0 .7-.6 1.3-1.3 1.3h-1.6l-.9.9v-.9H10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneBadgeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 7.8c.5 0 .9.2 1.2.7l.8 1.6c.2.4.2.8-.1 1.1l-.7.8c.8 1.6 1.7 2.5 3.2 3.2l.8-.7c.3-.3.7-.3 1.1-.1l1.6.8c.5.3.7.7.7 1.2v1c0 .6-.4 1-.9 1.2-1 .4-2.1.3-3.1 0-2.8-.8-5.8-3.8-6.6-6.6-.3-1-.4-2.1 0-3.1.2-.5.6-.9 1.2-.9h1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


