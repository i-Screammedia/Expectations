/**
 * Google Form 연동 설정
 * 설문지: AI 디지털 교육자료 기대평 이벤트 DB
 * https://docs.google.com/forms/d/1cG8rCSl3__clhyAfaVfjAXSNDSOSW46oc-XOgpwuC7k/preview
 */
const GOOGLE_FORM_CONFIG = {
  enabled: true,
  actionUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSfF4u9qv1KVPcXhY3Td7o15DxEheaJ7WTXjf72vy_zatxLWPA/formResponse',
  entries: {
    office: 'entry.1679036734', // 1. 소속 교육청명
    school: 'entry.2133529315', // 2. 학교명
    name: 'entry.400100134', // 3. 신청자 성함
    phone: 'entry.718301232', // 4. 연락처
    feature: 'entry.1462146372', // 5. 선택한 기능 (객관식)
    comment: 'entry.726953345', // 6. 댓글 내용
    // 랜딩페이지에서 이미 동의한 경우, 구글폼 2페이지 필수 항목 자동 전송
    consent: 'entry.331149771',
    consentValue: '개인 정보 수집 및 이용에 동의 합니다.',
    redirectAck: 'entry.1359851501',
    redirectAckValue: '체크하고 제출 버튼을 클릭해주세요.',
  },
};
