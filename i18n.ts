export const SUPPORTED_LANGUAGES = ["en", "zh-CN", "zh-TW", "ja", "ko"] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

const STORAGE_KEY = "stopping-distance-language";
type TranslationRow = readonly [english: string, simplifiedChinese: string, traditionalChinese: string, japanese: string, korean: string];

const rows: TranslationRow[] = [
  ["Hazard perception", "危险识别", "危險識別", "危険認知", "위험 인지"],
  ["Experiment 03 · hazard perception", "实验03 · 危险识别", "實驗03 · 危險識別", "実験03 · 危険認知", "실험03 · 위험 인지"],
  ["How quickly do you notice danger?", "你能多快发现危险？", "你能多快發現危險？", "危険にどれだけ早く気づける？", "위험을 얼마나 빨리 알아차릴까요?"],
  ["Watch the simulated dashcam clip. A pedestrian, cyclist or stopped vehicle will appear at a random moment. Click as soon as it becomes a hazard.", "观看模拟行车记录仪片段。行人、自行车或停止车辆会随机出现；当它构成危险时立即点击。", "觀看模擬行車記錄器片段。行人、自行車或停止車輛會隨機出現；當它構成危險時立即點擊。", "模擬ドライブレコーダー映像を見てください。歩行者、自転車、停止車両がランダムに現れ、危険になった瞬間にクリックします。", "모의 블랙박스 영상을 보세요. 보행자, 자전거 또는 정지 차량이 무작위로 나타나며 위험이 되는 순간 클릭하세요."],
  ["ROAD CAM · 01", "道路摄像头 · 01", "道路攝影機 · 01", "ロードカメラ · 01", "도로 카메라 · 01"],
  ["Simulated forward-facing road scene", "模拟前向道路场景", "模擬前向道路場景", "模擬前方道路シーン", "모의 전방 도로 장면"],
  ["Ready for a new clip.", "已准备好播放新片段。", "已準備好播放新片段。", "新しい映像の準備ができました。", "새 영상이 준비되었습니다."],
  ["Clip progress", "片段进度", "片段進度", "映像の進行", "영상 진행"],
  ["Start the clip, keep watching the road, then report the first developing hazard.", "开始片段并持续观察道路，然后报告第一个正在形成的危险。", "開始片段並持續觀察道路，然後報告第一個正在形成的危險。", "映像を開始して道路を見続け、最初に発生する危険を報告してください。", "영상을 시작하고 도로를 계속 관찰한 뒤 처음 발생하는 위험을 알려 주세요."],
  ["Start random clip", "开始随机片段", "開始隨機片段", "ランダム映像を開始", "무작위 영상 시작"],
  ["I see danger", "我发现危险", "我發現危險", "危険を発見", "위험 발견"],
  ["Your hazard response", "你的危险反应", "你的危險反應", "あなたの危険反応", "나의 위험 반응"],
  ["Good awareness", "良好的危险意识", "良好的危險意識", "良好な認知", "좋은 인지력"],
  ["Distance before your click", "点击前行驶距离", "點擊前行駛距離", "クリックまでの走行距離", "클릭 전 주행 거리"],
  ["If you waited 0.5 seconds longer", "如果再晚0.5秒", "如果再晚0.5秒", "さらに0.5秒遅れた場合", "0.5초 더 늦었다면"],
  ["Hazard response timeline", "危险反应时间线", "危險反應時間軸", "危険反応タイムライン", "위험 반응 타임라인"],
  ["Danger develops", "危险形成", "危險形成", "危険が発生", "위험 발생"],
  ["You respond", "你作出反应", "你作出反應", "あなたが反応", "반응 시점"],
  ["Half a second later", "再晚半秒", "再晚半秒", "0.5秒後", "0.5초 뒤"],
  ["This is a simulated hazard-perception exercise, not an official licensing test. Display and input latency affect the result.", "这是模拟危险识别练习，并非官方驾照考试。显示和输入延迟会影响结果。", "這是模擬危險識別練習，並非官方駕照考試。顯示和輸入延遲會影響結果。", "これは模擬危険認知練習で、公式の免許試験ではありません。画面と入力の遅延が結果に影響します。", "이는 모의 위험 인지 연습이며 공식 면허 시험이 아닙니다. 화면과 입력 지연이 결과에 영향을 줍니다."],
  ["Language", "语言", "語言", "言語", "언어"],
  ["Interactive stopping-distance simulator", "互动停车距离模拟器", "互動停車距離模擬器", "インタラクティブ停止距離シミュレーター", "대화형 정지 거리 시뮬레이터"],
  ["versus", "对比", "對比", "対", "대"],
  ["metres", "米", "公尺", "メートル", "미터"],
  ["When the", "当", "當", "速度", "속도"],
  ["km/h car has stopped, the", "km/h的车辆停下时，", "km/h的車輛停下時，", "km/hの車が停止しても、速度", "km/h 차량이 멈췄을 때, 속도"],
  ["km/h car is still travelling at approximately", "km/h的车辆仍以约", "km/h的車輛仍以約", "km/hの車はまだ約", "km/h 차량은 여전히 약"],
  ["Slightly shorter in one controlled US test", "在一项美国受控测试中略微缩短", "在一項美國受控測試中略微縮短", "米国の管理試験ではわずかに短縮", "미국 통제 시험에서는 약간 단축"],
  ["Longer in Continental’s wet test", "在大陆集团湿地测试中延长", "在 Continental 濕地測試中延長", "Continentalの湿潤路面試験では延長", "Continental 젖은 노면 시험에서는 증가"],
  ["Measure your reaction time, test a sudden stop, then try three quick challenges about following gaps, small speed differences and predicting danger.", "测量你的反应时间、测试紧急停车，再完成三个关于跟车距离、微小速度差和危险预测的快速挑战。", "測量你的反應時間、測試緊急停車，再完成三個關於跟車距離、微小速度差和危險預測的快速挑戰。", "反応時間と急停止を試し、車間距離・小さな速度差・危険予測の3つの課題に挑戦します。", "반응 시간과 급정지를 시험한 뒤 차간 거리, 작은 속도 차이, 위험 예측의 세 가지 도전을 해 보세요."],
  ["Published Australian guidance compares cars and trucks at the same speed. The truck consistently needs more road before it stops.", "澳大利亚政府公布的资料比较了相同速度下的小轿车和卡车；卡车始终需要更长距离才能停下。", "澳洲政府公布的資料比較了相同速度下的小客車和卡車；卡車始終需要更長距離才能停下。", "オーストラリア政府の公表資料では同じ速度の乗用車とトラックを比較しており、トラックは常により長い停止距離を要します。", "호주 정부 공개 자료는 같은 속도의 승용차와 트럭을 비교하며, 트럭은 항상 더 긴 정지 거리가 필요합니다."],
  ["Choose one of the five speeds published by the NT Government.", "选择北领地政府公布的五种速度之一。", "選擇北領地政府公布的五種速度之一。", "北部準州政府が公表した5段階の速度から選んでください。", "노던테리토리 정부가 공개한 다섯 속도 중 하나를 선택하세요."],
  ["at the same speed", "在相同速度下", "在相同速度下", "同じ速度で", "같은 속도에서"],
  ["Why no tread or weather control?", "为什么没有胎纹或天气控制？", "為什麼沒有胎紋或天氣控制？", "なぜ溝や天候を変更できないのですか？", "왜 트레드나 날씨 조절이 없나요?"],
  ["This is a separate published comparison, not the passenger-car model above. The source does not break the truck figures down by tyre tread, road condition, load or truck configuration.", "这是独立发布的对比数据，并非上方的小轿车模型。数据源没有按胎纹、路况、载重或卡车配置细分结果。", "這是獨立發布的對比資料，並非上方的小客車模型。資料來源沒有按胎紋、路況、載重或卡車配置細分結果。", "これは上の乗用車モデルとは別の公表比較です。出典はトラックの値を溝、路面、積載量、車両構成別に分けていません。", "이는 위 승용차 모델과 별도의 공개 비교입니다. 출처는 트럭 수치를 트레드, 노면, 적재량, 차량 구성별로 나누지 않습니다."],
  ["View the NT Government source", "查看北领地政府数据源", "查看北領地政府資料來源", "北部準州政府の出典を見る", "노던테리토리 정부 출처 보기"],
  ["Reaction distance rises with speed. Braking distance rises with speed squared—and wet roads or worn tread stretch it further.", "反应距离随速度线性增加。制动距离随速度的平方增加——湿滑路面或磨损胎纹会让距离进一步延长。", "反應距離隨速度線性增加。煞車距離隨速度的平方增加——濕滑路面或磨損胎紋會讓距離進一步延長。", "反応距離は速度に比例し、制動距離は速度の二乗で増えます。濡れた路面や摩耗したタイヤはさらに距離を延ばします。", "반응 거리는 속도에 비례하고 제동 거리는 속도의 제곱으로 늘어납니다. 젖은 노면과 마모된 트레드는 거리를 더 늘립니다."],
  ["Reaction time is fixed at 1.5 seconds. Dry and wet braking are calibrated to the Queensland Government stopping-distance table.", "反应时间固定为1.5秒。干地与湿地制动以昆士兰政府停车距离表校准。", "反應時間固定為1.5秒。乾地與濕地煞車以昆士蘭政府停車距離表校準。", "反応時間は1.5秒に固定し、乾燥・湿潤時の制動はクイーンズランド州政府の停止距離表で校正しています。", "반응 시간은 1.5초로 고정하며 건조·젖은 노면 제동은 퀸즐랜드 정부 정지 거리 표로 보정합니다."],
  ["Wet tread adjustment uses Continental tests at 8.0, 3.0 and 1.6mm. Dry tread adjustment uses a US Tire Rack test at approximately 8.0, 3.2 and 1.6mm. Values between test points are linear interpolations.", "湿地胎纹修正采用大陆集团在8.0、3.0和1.6毫米下的测试；干地采用美国Tire Rack约8.0、3.2和1.6毫米的测试。测试点之间使用线性插值。", "濕地胎紋修正採用 Continental 在8.0、3.0和1.6毫米下的測試；乾地採用美國 Tire Rack 約8.0、3.2和1.6毫米的測試。測試點之間使用線性插值。", "湿潤路面はContinentalの8.0、3.0、1.6mm試験、乾燥路面は米国Tire Rackの約8.0、3.2、1.6mm試験で補正し、試験点の間は線形補間しています。", "젖은 노면은 Continental의 8.0, 3.0, 1.6mm 시험, 건조 노면은 미국 Tire Rack의 약 8.0, 3.2, 1.6mm 시험으로 보정하며 시험점 사이는 선형 보간합니다."],
  ["The dry test found only a 1.7% shorter stop with shallower tread. It does not show that aged, cracked or damaged tyres are safer, and results vary by tyre and vehicle.", "干地测试中浅胎纹仅缩短1.7%的停车距离。这不表示老化、开裂或损坏的轮胎更安全；结果也会因轮胎和车辆而异。", "乾地測試中淺胎紋僅縮短1.7%的停車距離。這不表示老化、龜裂或損壞的輪胎更安全；結果也會因輪胎和車輛而異。", "乾燥路面試験で浅い溝による短縮は1.7%だけでした。老化・亀裂・損傷したタイヤが安全という意味ではなく、結果はタイヤと車両で異なります。", "건조 노면 시험에서 얕은 트레드의 정지 거리 단축은 1.7%에 불과했습니다. 노후·균열·손상 타이어가 더 안전하다는 뜻은 아니며 결과는 타이어와 차량에 따라 달라집니다."],
  ["Queensland stopping-distance data", "昆士兰停车距离数据", "昆士蘭停車距離資料", "クイーンズランド停止距離データ", "퀸즐랜드 정지 거리 데이터"],
  ["Continental wet-braking test", "大陆集团湿地制动测试", "Continental 濕地煞車測試", "Continental湿潤路面制動試験", "Continental 젖은 노면 제동 시험"],
  ["Tire Rack dry-braking test", "Tire Rack干地制动测试", "Tire Rack乾地煞車測試", "Tire Rack乾燥路面制動試験", "Tire Rack 건조 노면 제동 시험"],
  ["NT truck comparison", "北领地卡车对比", "北領地卡車對比", "北部準州トラック比較", "노던테리토리 트럭 비교"],
  ["Educational model only. Real stopping distance depends on the vehicle, driver, tyres, road and weather.", "仅为教育模型。实际停车距离取决于车辆、驾驶员、轮胎、道路和天气。", "僅為教育模型。實際停車距離取決於車輛、駕駛人、輪胎、道路和天氣。", "教育用モデルです。実際の停止距離は車両、運転者、タイヤ、道路、天候で変わります。", "교육용 모델입니다. 실제 정지 거리는 차량, 운전자, 타이어, 도로와 날씨에 따라 달라집니다."],
  ["Press the button or spacebar as soon as the obstacle appears. The delay is random, so do not anticipate it.", "障碍物出现后立即点击按钮或按空格键。等待时间随机，请不要提前猜测。", "障礙物出現後立即點擊按鈕或按空白鍵。等待時間隨機，請不要提前猜測。", "障害物が現れたらすぐにボタンかスペースキーを押します。待ち時間はランダムなので先読みしないでください。", "장애물이 나타나면 즉시 버튼이나 스페이스바를 누르세요. 대기 시간은 무작위이므로 미리 누르지 마세요."],
  ["Space", "空格键", "空白鍵", "スペース", "스페이스"],
  ["Your measured time has been transferred to the obstacle challenge below.", "测得的反应时间已自动带入下方的障碍物挑战。", "測得的反應時間已自動帶入下方的障礙物挑戰。", "測定した時間を下の障害物チャレンジに反映しました。", "측정한 시간을 아래 장애물 도전에 적용했습니다."],
  ["This browser test includes screen, keyboard, mouse and device latency. Treat it as an illustration—not a clinical measurement of driving performance.", "此浏览器测试包含屏幕、键盘、鼠标和设备延迟。它仅用于演示，并非对驾驶表现的临床测量。", "此瀏覽器測試包含螢幕、鍵盤、滑鼠和裝置延遲。它僅用於示範，並非對駕駛表現的臨床測量。", "このブラウザー試験には画面、キーボード、マウス、端末の遅延が含まれます。運転能力の医学的測定ではなく説明用です。", "이 브라우저 시험에는 화면, 키보드, 마우스와 기기 지연이 포함됩니다. 운전 능력의 임상 측정이 아닌 설명용입니다."],
  ["The obstacle is fixed ahead. Balance speed, reaction time and road grip, then see where the vehicle actually ends up.", "障碍物固定在前方。平衡速度、反应时间和路面抓地力，再看看车辆最终停在哪里。", "障礙物固定在前方。平衡速度、反應時間和路面抓地力，再看看車輛最終停在哪裡。", "前方の障害物は固定です。速度、反応時間、路面グリップを調整して車が実際にどこで止まるか確認します。", "장애물은 앞에 고정되어 있습니다. 속도, 반응 시간과 노면 접지력을 조절해 차량이 실제로 어디에 멈추는지 확인하세요."],
  ["Start", "起点", "起點", "開始", "시작"],
  ["Total", "总计", "總計", "合計", "합계"],
  ["Educational model:", "教育模型：", "教育模型：", "教育用モデル：", "교육용 모델:"],
  ["braking uses speed² ÷ (2 × grip × gravity). “Dry”, “wet” and “icy” are simplified teaching coefficients. Real stopping distance also depends on tyres, brakes, gradient, vehicle load and driver condition; do not use this page as the sole basis for a real driving gap.", "制动采用速度² ÷（2 × 抓地力 × 重力）的公式。“干燥”“湿滑”和“结冰”使用简化的教学系数。实际停车距离还取决于轮胎、制动器、坡度、载重和驾驶员状态；请勿仅依据本页决定真实跟车距离。", "煞車採用速度² ÷（2 × 抓地力 × 重力）的公式。「乾燥」「濕滑」和「結冰」使用簡化的教學係數。實際停車距離還取決於輪胎、煞車、坡度、載重和駕駛人狀態；請勿僅依據本頁決定真實跟車距離。", "制動は速度² ÷（2 × グリップ × 重力）で計算します。「乾燥」「湿潤」「凍結」は簡略化した教育用係数です。実際はタイヤ、ブレーキ、勾配、積載量、運転者にも左右されるため、実際の車間距離をこのページだけで決めないでください。", "제동은 속도² ÷ (2 × 접지력 × 중력)으로 계산합니다. '건조', '젖음', '결빙'은 단순화한 교육용 계수입니다. 실제 정지 거리는 타이어, 브레이크, 경사, 적재량과 운전자 상태에도 좌우되므로 실제 차간 거리를 이 페이지만으로 정하지 마세요."],
  ["These short games turn the same stopping model into decisions drivers make every day: how closely to follow, what 10 km/h changes, and whether the available road is enough.", "这些小游戏把同一停车模型转化为驾驶员每天面对的决定：跟车多近、10 km/h会改变什么，以及剩余道路是否足够。", "這些小遊戲把同一停車模型轉化為駕駛人每天面對的決定：跟車多近、10 km/h會改變什麼，以及剩餘道路是否足夠。", "同じ停止モデルを、車間距離、10 km/hの差、道路が足りるかという日常の判断に置き換えた短いゲームです。", "같은 정지 모델을 차간 거리, 10 km/h의 차이, 남은 도로가 충분한지 같은 일상 판단으로 바꾼 짧은 게임입니다."],
  ["The lead car brakes hard on a dry road. Your road may have less grip.", "前车在干燥路面急刹，而你所在的路面抓地力可能更低。", "前車在乾燥路面急煞，而你所在的路面抓地力可能更低。", "先行車は乾燥路面で急制動します。あなた側の路面はグリップが低いかもしれません。", "앞차는 건조 노면에서 급제동합니다. 내 노면의 접지력은 더 낮을 수 있습니다."],
  ["1 sec", "1秒", "1秒", "1秒", "1초"], ["2 sec", "2秒", "2秒", "2秒", "2초"], ["3 sec", "3秒", "3秒", "3秒", "3초"], ["4 sec", "4秒", "4秒", "4秒", "4초"],
  ["Focused · 0.8 s", "专注 · 0.8秒", "專注 · 0.8秒", "集中 · 0.8秒", "집중 · 0.8초"],
  ["Tired · 1.5 s", "疲劳 · 1.5秒", "疲勞 · 1.5秒", "疲労 · 1.5秒", "피로 · 1.5초"],
  ["Distracted · 2.5 s", "分心 · 2.5秒", "分心 · 2.5秒", "注意散漫 · 2.5秒", "주의 분산 · 2.5초"],
  ["Your road", "你的路面", "你的路面", "あなたの路面", "내 노면"],
  ["Settings changed. Test this gap.", "设置已更改，请测试这个车距。", "設定已變更，請測試這個車距。", "設定が変わりました。この車間を試してください。", "설정이 바뀌었습니다. 이 간격을 시험하세요."],
  ["The lead car will brake hard on a dry road.", "前车将在干燥路面急刹。", "前車將在乾燥路面急煞。", "先行車が乾燥路面で急制動します。", "앞차가 건조 노면에서 급제동합니다."],
  ["The orange car travels just 10 km/h faster. Both drivers react in 1.2 seconds.", "橙色车辆仅快10 km/h，两名驾驶员的反应时间均为1.2秒。", "橙色車輛僅快10 km/h，兩名駕駛人的反應時間均為1.2秒。", "オレンジの車は10 km/h速いだけで、両者の反応時間は1.2秒です。", "주황색 차량은 10 km/h 더 빠를 뿐이며 두 운전자의 반응 시간은 1.2초입니다."],
  ["Slower ·", "较慢 ·", "較慢 ·", "低速 ·", "느린 차량 ·"], ["Faster ·", "较快 ·", "較快 ·", "高速 ·", "빠른 차량 ·"],
  ["Road", "路面", "路面", "路面", "노면"],
  ["How much difference can 10 km/h make?", "10 km/h能带来多大差别？", "10 km/h能帶來多大差別？", "10 km/hでどれほど変わる？", "10 km/h가 얼마나 큰 차이를 만들까요?"],
  ["Run the cars to reveal the faster car’s remaining speed.", "让两辆车行驶，查看较快车辆的剩余速度。", "讓兩輛車行駛，查看較快車輛的剩餘速度。", "2台を走らせ、速い車に残る速度を確認します。", "두 차량을 출발시켜 빠른 차량의 남은 속도를 확인하세요."],
  ["Question", "第", "第", "問題", "문제"], ["of 5 · Score", "/ 5 · 得分", "/ 5 · 得分", "/ 5 · 得点", "/ 5 · 점수"],
  ["Predict the outcome before the calculation is revealed.", "请在显示计算结果前预测结局。", "請在顯示計算結果前預測結果。", "計算結果を見る前に予測してください。", "계산 결과가 나오기 전에 결과를 예측하세요."],
  ["You will see the exact stopping distance after answering.", "回答后将显示准确停车距离。", "回答後將顯示準確停車距離。", "回答後に正確な停止距離を表示します。", "답한 뒤 정확한 정지 거리가 표시됩니다."],
  ["Next question", "下一题", "下一題", "次の問題", "다음 문제"],
  ["Do not:", "不要：", "不要：", "禁止：", "하지 마세요:"],
  ["Stop suddenly in a live traffic lane simply because visibility has fallen.", "不要仅因为能见度下降就在行车道内突然停车。", "不要僅因能見度下降就在行車道內突然停車。", "視界が悪くなっただけで走行車線内に急停止しないでください。", "시야가 나빠졌다는 이유로 주행 차로에서 갑자기 멈추지 마세요."],
  ["NSW Government—poor conditions", "新南威尔士州政府——恶劣路况", "新南威爾斯州政府——惡劣路況", "NSW州政府—悪条件", "NSW 정부—악조건"],
  ["Queensland Government—wet weather", "昆士兰政府——湿滑天气", "昆士蘭政府——潮濕天氣", "クイーンズランド州政府—雨天", "퀸즐랜드 정부—우천"],
  ["Queensland Government—dusty conditions", "昆士兰政府——沙尘天气", "昆士蘭政府——沙塵天氣", "クイーンズランド州政府—砂塵", "퀸즐랜드 정부—먼지 환경"],
  ["Bureau of Meteorology—know your risk", "澳大利亚气象局——了解风险", "澳洲氣象局——了解風險", "気象局—リスクを知る", "기상청—위험 알기"],
  ["Compare this result with the evidence-based car and truck models.", "将结果与基于证据的小轿车和卡车模型进行比较。", "將結果與基於證據的小客車和卡車模型進行比較。", "結果を根拠に基づく乗用車・トラックモデルと比べましょう。", "결과를 근거 기반 승용차·트럭 모델과 비교해 보세요."],
  ["Stopping distance", "停车距离", "停車距離", "停止距離", "정지 거리"],
  ["Speed × grip × distance", "速度 × 抓地力 × 距离", "速度 × 抓地力 × 距離", "速度 × グリップ × 距離", "속도 × 접지력 × 거리"],
  ["How much road do you really need to stop?", "你到底需要多长的道路才能停下？", "你到底需要多長的道路才能停下？", "停止するには本当にどれだけの道路が必要？", "멈추려면 실제로 얼마나 긴 도로가 필요할까요?"],
  ["The danger begins before your foot even reaches the brake.", "危险在脚踩到刹车之前就已经开始。", "危險在腳踩到煞車之前就已經開始。", "危険はブレーキを踏む前から始まります。", "위험은 브레이크를 밟기 전부터 시작됩니다."],
  ["Total stopping distance", "总停车距离", "總停車距離", "総停止距離", "총 정지 거리"],
  ["Try a scenario", "尝试一个场景", "嘗試一個場景", "シナリオを試す", "상황 선택"],
  ["City · dry", "城市 · 干燥", "城市 · 乾燥", "市街地 · 乾燥", "도심 · 건조"],
  ["Commute · rain", "通勤 · 雨天", "通勤 · 雨天", "通勤 · 雨", "출퇴근 · 비"],
  ["Motorway · worn", "高速 · 磨损轮胎", "高速 · 磨損輪胎", "高速道路 · 摩耗タイヤ", "고속도로 · 마모 타이어"],
  ["Vehicle speed", "车速", "車速", "車速", "차량 속도"],
  ["Tyre tread", "轮胎花纹", "輪胎花紋", "タイヤ溝", "타이어 트레드"],
  ["Road condition", "路面状况", "路面狀況", "路面状態", "노면 상태"],
  ["Dry", "干燥", "乾燥", "乾燥", "건조"],
  ["Wet", "湿滑", "濕滑", "濡れた路面", "젖은 노면"],
  ["Icy", "结冰", "結冰", "凍結", "결빙"],
  ["Reaction distance", "反应距离", "反應距離", "反応距離", "반응 거리"],
  ["Braking distance", "制动距离", "煞車距離", "制動距離", "제동 거리"],
  ["Total distance", "总距离", "總距離", "合計距離", "총 거리"],
  ["The cost of 10 km/h", "快10 km/h的代价", "快10 km/h的代價", "時速10 kmの代償", "시속 10km의 대가"],
  ["One tyre, opposite outcomes", "同一轮胎，不同结果", "同一輪胎，不同結果", "同じタイヤ、逆の結果", "같은 타이어, 다른 결과"],
  ["Tread matters most in water.", "胎纹在湿地最重要。", "胎紋在濕地最重要。", "溝の深さは濡れた路面で最も重要。", "트레드는 젖은 노면에서 가장 중요합니다."],
  ["Put yourself in the driver’s seat", "亲自坐进驾驶座", "親自坐進駕駛座", "運転席で体験する", "운전석에서 직접 체험하기"],
  ["Numbers explain it. Your reflexes make it real.", "数字负责解释，反应让危险变得真实。", "數字負責解釋，反應讓危險變得真實。", "数字で理解し、反射神経で実感する。", "숫자로 이해하고 반응으로 체감하세요."],
  ["Open the reaction & braking lab", "打开反应与制动实验室", "開啟反應與煞車實驗室", "反応・制動ラボを開く", "반응·제동 실험실 열기"],
  ["Heavy vehicle comparison", "重型车辆对比", "重型車輛對比", "大型車比較", "대형 차량 비교"],
  ["A truck needs its own safety margin.", "卡车需要更大的安全余量。", "卡車需要更大的安全餘量。", "トラックには専用の安全余裕が必要。", "트럭에는 더 큰 안전 여유가 필요합니다."],
  ["Car", "轿车", "轎車", "乗用車", "승용차"],
  ["Truck", "卡车", "卡車", "トラック", "트럭"],
  ["Extra road needed", "额外所需距离", "額外所需距離", "追加で必要な距離", "추가 필요 거리"],
  ["The part most drivers underestimate", "多数驾驶员低估的部分", "多數駕駛員低估的部分", "多くの運転者が過小評価する点", "대부분 운전자가 과소평가하는 부분"],
  ["Speed costs you twice.", "速度会让你付出双重代价。", "速度會讓你付出雙重代價。", "速度は二重の代償を生む。", "속도는 두 배의 대가를 요구합니다."],
  ["Evidence, not a guarantee", "依据证据，而非安全保证", "依據證據，而非安全保證", "根拠であり保証ではない", "근거일 뿐 보장은 아닙니다"],
  ["What this model assumes", "模型采用的假设", "模型採用的假設", "モデルの前提", "모델의 가정"],
  ["← Back to the main explainer", "← 返回主页面", "← 返回主頁面", "← メイン解説へ戻る", "← 메인 설명으로 돌아가기"],
  ["Five interactive challenges", "五项互动挑战", "五項互動挑戰", "5つの体験型チャレンジ", "다섯 가지 체험형 도전"],
  ["Do you react before the road runs out?", "道路用完之前，你反应得过来吗？", "道路用完之前，你反應得過來嗎？", "道路が尽きる前に反応できる？", "도로가 끝나기 전에 반응할 수 있을까요?"],
  ["Measure your response, then put it into a braking challenge where every metre matters.", "测量你的反应，再把结果带入每一米都至关重要的制动挑战。", "測量你的反應，再把結果帶入每一米都至關重要的煞車挑戰。", "反応を測り、1メートルが重要な制動チャレンジで試そう。", "반응을 측정하고 1미터가 중요한 제동 도전에 적용하세요."],
  ["Test your reaction", "测试反应", "測試反應", "反応を測る", "반응 측정"],
  ["Avoid the obstacle", "避开障碍物", "避開障礙物", "障害物を避ける", "장애물 피하기"],
  ["Quick challenges", "快速挑战", "快速挑戰", "クイックチャレンジ", "빠른 도전"],
  ["Weather guide", "天气指南", "天氣指南", "悪天候ガイド", "악천후 가이드"],
  ["Experiment 01 · reaction distance", "实验01 · 反应距离", "實驗01 · 反應距離", "実験01 · 反応距離", "실험01 · 반응 거리"],
  ["Brake when the hazard appears.", "危险出现时立即刹车。", "危險出現時立即煞車。", "危険が現れたらブレーキ。", "위험이 나타나면 제동하세요."],
  ["Ready to test your reflexes?", "准备测试你的反应了吗？", "準備測試你的反應了嗎？", "反射神経を試す準備はいい？", "반응 속도를 시험할 준비가 됐나요?"],
  ["Start the run, then wait for the hazard.", "开始行驶，然后等待危险出现。", "開始行駛，然後等待危險出現。", "走行を開始し、危険を待ってください。", "주행을 시작한 뒤 위험을 기다리세요."],
  ["Start driving", "开始行驶", "開始行駛", "走行開始", "주행 시작"],
  ["Brake", "刹车", "煞車", "ブレーキ", "제동"],
  ["Your reaction time", "你的反应时间", "你的反應時間", "あなたの反応時間", "나의 반응 시간"],
  ["Distance travelled at 80 km/h", "80 km/h时行驶的距离", "80 km/h時行駛的距離", "80 km/hで進む距離", "80 km/h에서 이동한 거리"],
  ["Experiment 02 · obstacle challenge", "实验02 · 障碍物挑战", "實驗02 · 障礙物挑戰", "実験02 · 障害物チャレンジ", "실험02 · 장애물 도전"],
  ["Choose a speed. Test the stop.", "选择速度，测试停车。", "選擇速度，測試停車。", "速度を選び、停止を試す。", "속도를 정하고 정지를 시험하세요."],
  ["Sunny residential", "晴天住宅区", "晴天住宅區", "晴れた住宅街", "맑은 주택가"],
  ["Rainy city", "雨天城市", "雨天城市", "雨の市街地", "비 오는 도심"],
  ["Tired at night", "夜间疲劳驾驶", "夜間疲勞駕駛", "夜間の疲労運転", "야간 피로 운전"],
  ["Wet motorway", "湿滑高速公路", "濕滑高速公路", "濡れた高速道路", "젖은 고속도로"],
  ["Speed", "速度", "速度", "速度", "속도"],
  ["Reaction time", "反应时间", "反應時間", "反応時間", "반응 시간"],
  ["Focused", "专注", "專注", "集中", "집중"],
  ["Tired", "疲劳", "疲勞", "疲労", "피로"],
  ["Distracted", "分心", "分心", "注意散漫", "주의 분산"],
  ["Road surface", "路面", "路面", "路面", "노면"],
  ["Obstacle distance", "障碍物距离", "障礙物距離", "障害物までの距離", "장애물 거리"],
  ["Test the brakes", "测试刹车", "測試煞車", "ブレーキを試す", "제동 시험"],
  ["Ready when you are", "随时可以开始", "隨時可以開始", "準備ができたら開始", "준비되면 시작하세요"],
  ["Will 55 metres be enough?", "55米够停下来吗？", "55米夠停下來嗎？", "55メートルで足りる？", "55미터면 충분할까요?"],
  ["Adjust the controls, then test the brakes to reveal the outcome.", "调整控制项，再测试刹车查看结果。", "調整控制項，再測試煞車查看結果。", "設定を調整し、ブレーキを試して結果を確認。", "설정을 조절하고 제동을 시험해 결과를 확인하세요."],
  ["Reaction", "反应", "反應", "反応", "반응"],
  ["Braking", "制动", "煞車", "制動", "제동"],
  ["Obstacle", "障碍物", "障礙物", "障害物", "장애물"],
  ["Three quick challenges", "三项快速挑战", "三項快速挑戰", "3つのクイックチャレンジ", "세 가지 빠른 도전"],
  ["Can you judge the danger before seeing the answer?", "看到答案前，你能判断危险吗？", "看到答案前，你能判斷危險嗎？", "答えを見る前に危険を判断できる？", "정답을 보기 전에 위험을 판단할 수 있을까요?"],
  ["Following gap", "跟车距离", "跟車距離", "車間距離", "차간 거리"],
  ["How many seconds would you leave?", "你会留下几秒车距？", "你會留下幾秒車距？", "何秒の車間を空ける？", "몇 초의 간격을 둘까요?"],
  ["Test this gap", "测试这个车距", "測試這個車距", "この車間を試す", "이 간격 시험"],
  ["Only 10 km/h faster", "只快10 km/h", "只快10 km/h", "わずか10 km/h速い", "단 10 km/h 더 빠름"],
  ["Two cars. The same hazard.", "两辆车，同一个危险。", "兩輛車，同一個危險。", "2台の車、同じ危険。", "두 차량, 같은 위험."],
  ["Slower car speed", "较慢车辆速度", "較慢車輛速度", "遅い車の速度", "느린 차량 속도"],
  ["Run both cars", "让两辆车同时行驶", "讓兩輛車同時行駛", "2台を走らせる", "두 차량 실행"],
  ["Five-round prediction", "五题预测", "五題預測", "5問予測", "5문제 예측"],
  ["Will the car stop in time?", "车辆能及时停下吗？", "車輛能及時停下嗎？", "車は間に合って止まる？", "차량이 제때 멈출까요?"],
  ["Stops safely", "安全停车", "安全停車", "安全に停止", "안전 정지"],
  ["Barely stops", "勉强停车", "勉強停車", "ぎりぎり停止", "간신히 정지"],
  ["Collision", "发生碰撞", "發生碰撞", "衝突", "충돌"],
  ["Make your prediction.", "作出你的预测。", "作出你的預測。", "予測してください。", "결과를 예측하세요."],
  ["Severe-weather safety guide", "恶劣天气安全指南", "惡劣天氣安全指南", "悪天候安全ガイド", "악천후 안전 가이드"],
  ["When conditions change, your plan must change first.", "天气变化时，首先要改变的是你的计划。", "天氣變化時，首先要改變的是你的計畫。", "状況が変わったら、まず計画を変える。", "상황이 바뀌면 계획부터 바꿔야 합니다."],
  ["Before you leave", "出发之前", "出發之前", "出発前", "출발 전"],
  ["Plan and prepare", "规划与准备", "規劃與準備", "計画と準備", "계획과 준비"],
  ["Heavy rain", "暴雨", "暴雨", "大雨", "폭우"],
  ["Grip and visibility", "抓地力与能见度", "抓地力與能見度", "グリップと視界", "접지력과 시야"],
  ["Fog, dust or smoke", "雾、沙尘或烟雾", "霧、沙塵或煙霧", "霧・砂塵・煙", "안개·먼지·연기"],
  ["Reduced visibility", "能见度降低", "能見度降低", "視界不良", "시야 저하"],
  ["Floodwater", "洪水积水", "洪水積水", "冠水", "홍수"],
  ["Turn around", "立即掉头", "立即掉頭", "引き返す", "되돌아가기"],
  ["Wind, ice or snow", "强风、结冰或积雪", "強風、結冰或積雪", "強風・凍結・雪", "강풍·결빙·눈"],
  ["Instability and low grip", "不稳定与低抓地力", "不穩定與低抓地力", "不安定・低グリップ", "불안정과 낮은 접지력"],
  ["Check before the wheels move.", "车轮转动前先检查。", "車輪轉動前先檢查。", "走り出す前に確認。", "출발 전에 확인하세요."],
  ["Check official warnings", "查看官方预警", "查看官方預警", "公式警報を確認", "공식 경보 확인"],
  ["Check the vehicle", "检查车辆", "檢查車輛", "車両を点検", "차량 점검"],
  ["Keep another plan", "准备备用方案", "準備備用方案", "別の計画を用意", "대안 마련"],
  ["Slow down and make every input smooth.", "减速，并保持所有操作平顺。", "減速，並保持所有操作平順。", "減速し、操作を滑らかに。", "감속하고 모든 조작을 부드럽게 하세요."],
  ["Use low-beam lights and the demister", "使用近光灯和除雾功能", "使用近光燈和除霧功能", "ロービームとデフロスターを使用", "하향등과 성에 제거 장치 사용"],
  ["Double the following time", "将跟车时间加倍", "將跟車時間加倍", "車間時間を2倍に", "차간 시간을 두 배로"],
  ["Avoid sudden control inputs", "避免突然操作", "避免突然操作", "急操作を避ける", "급조작 피하기"],
  ["Be visible without dazzling anyone.", "提高可见性，但不要晃到他人。", "提高能見度，但不要晃到他人。", "眩惑せず見える状態に。", "눈부심 없이 잘 보이게 하세요."],
  ["Slow down and use low beam", "减速并使用近光灯", "減速並使用近光燈", "減速してロービーム", "감속하고 하향등 사용"],
  ["Do not overtake in dust", "沙尘中不要超车", "沙塵中不要超車", "砂塵では追い越さない", "먼지 속 추월 금지"],
  ["Stop somewhere genuinely safe", "在真正安全的位置停车", "在真正安全的位置停車", "本当に安全な場所で停止", "실제로 안전한 곳에 정차"],
  ["If it is flooded, forget it.", "道路被淹，立即放弃通行。", "道路被淹，立即放棄通行。", "冠水していたら進まない。", "침수됐다면 지나가지 마세요."],
  ["Stop before the water", "在水域前停车", "在水域前停車", "水の手前で停止", "물 앞에서 정지"],
  ["Turn around and find another route", "掉头寻找其他路线", "掉頭尋找其他路線", "引き返して別ルートへ", "되돌아가 다른 경로 찾기"],
  ["Check the road after flooding", "洪水后检查道路状况", "洪水後檢查道路狀況", "冠水後の道路を確認", "홍수 후 도로 확인"],
  ["Create time, space and gentle movement.", "留出时间、空间并保持平顺。", "留出時間、空間並保持平順。", "時間と空間を作り、穏やかに操作。", "시간과 공간을 확보하고 부드럽게 움직이세요."],
  ["Follow warnings and advisory speeds", "遵循预警和建议速度", "遵循預警和建議速度", "警報と推奨速度に従う", "경보와 권장 속도 준수"],
  ["Reduce speed and increase the gap", "降低速度并增加车距", "降低速度並增加車距", "減速して車間を広げる", "감속하고 간격 늘리기"],
  ["Expect instability", "预判车辆不稳定", "預判車輛不穩定", "不安定さを予測", "불안정성 예상"],
  ["Choose a condition to reveal the actions recommended by Australian road-safety authorities. If conditions become severe, delaying the trip or stopping safely is often the best decision.", "选择天气状况，查看澳大利亚道路安全部门建议的行动。如果天气变得严重，延期出行或安全停车通常是最佳选择。", "選擇天氣狀況，查看澳洲道路安全部門建議的行動。如果天氣變得嚴重，延期出行或安全停車通常是最佳選擇。", "状況を選び、豪州の道路安全当局が推奨する行動を確認してください。深刻な場合は延期や安全な停止が最善です。", "상황을 선택해 호주 도로 안전 기관의 권고 행동을 확인하세요. 악화되면 여행 연기나 안전한 정차가 최선입니다."],
  ["The safest severe-weather drive may be the one you postpone.", "面对严重天气，最安全的行程可能是延期的行程。", "面對嚴重天氣，最安全的行程可能是延期的行程。", "悪天候では、延期することが最も安全な運転判断かもしれません。", "악천후에서는 운전을 미루는 것이 가장 안전할 수 있습니다."],
  ["Review the forecast, road closures, storms, bushfires, hail, snow, dust and heavy fog before leaving.", "出发前查看天气预报、道路封闭、风暴、山火、冰雹、降雪、沙尘和浓雾信息。", "出發前查看天氣預報、道路封閉、風暴、山火、冰雹、降雪、沙塵和濃霧資訊。", "出発前に予報、通行止め、嵐、山火事、ひょう、雪、砂塵、濃霧を確認。", "출발 전 예보, 도로 통제, 폭풍, 산불, 우박, 눈, 먼지와 짙은 안개를 확인하세요."],
  ["Tyre tread, lights, windscreen, wipers and demister all matter when grip and visibility fall.", "抓地力和能见度下降时，轮胎花纹、车灯、挡风玻璃、雨刷和除雾器都很重要。", "抓地力和能見度下降時，輪胎花紋、車燈、擋風玻璃、雨刷和除霧器都很重要。", "グリップや視界が低下する時は、タイヤ溝、灯火、窓、ワイパー、デフロスターが重要です。", "접지력과 시야가 나빠질 때는 트레드, 등화, 유리, 와이퍼와 성에 제거 장치가 중요합니다."],
  ["Change the route, delay the trip or arrange another way to travel if conditions are unpredictable or severe.", "天气难以预测或十分恶劣时，应改变路线、延期出行或选择其他交通方式。", "天氣難以預測或十分惡劣時，應改變路線、延期出行或選擇其他交通方式。", "予測不能・深刻な状況では、経路変更、延期、別の移動手段を選択。", "예측이 어렵거나 심각하면 경로를 바꾸고, 여행을 미루거나 다른 교통수단을 선택하세요."],
  ["Decision rule:", "决策原则：", "決策原則：", "判断基準：", "판단 원칙:"],
  ["If the conditions are beyond your ability or visibility, do not continue.", "如果天气超出你的操控能力或可见范围，请勿继续行驶。", "如果天氣超出你的操控能力或可見範圍，請勿繼續行駛。", "能力や視界を超える状況なら走行を続けないでください。", "상황이 운전 능력이나 시야를 넘어선다면 계속 주행하지 마세요."],
  ["Wet roads increase stopping distance and the risk of aquaplaning.", "湿滑路面会增加停车距离和水滑风险。", "濕滑路面會增加停車距離和水滑風險。", "濡れた路面は停止距離とハイドロプレーニングの危険を増やします。", "젖은 노면은 정지 거리와 수막현상 위험을 높입니다."],
  ["Make the vehicle easier to see and keep the windscreen clear of condensation.", "让其他道路使用者更容易看见车辆，并保持挡风玻璃无雾。", "讓其他道路使用者更容易看見車輛，並保持擋風玻璃無霧。", "車を見えやすくし、フロントガラスの曇りを除去。", "차량이 잘 보이게 하고 앞유리의 김을 제거하세요."],
  ["Queensland guidance recommends at least 4 seconds for a standard car in wet weather, compared with 2 seconds in good conditions.", "昆士兰指南建议普通轿车在湿地至少保持4秒车距，良好天气则至少2秒。", "昆士蘭指南建議普通轎車在濕地至少保持4秒車距，良好天氣則至少2秒。", "クイーンズランド州は普通車に、良好時2秒、雨天は最低4秒を推奨。", "퀸즐랜드 지침은 승용차에 맑은 날 2초, 우천 시 최소 4초 간격을 권장합니다."],
  ["Brake, accelerate and steer smoothly. Slow down and avoid cruise control to reduce aquaplaning risk.", "平顺刹车、加速和转向；降低速度并避免使用巡航控制，以减少水滑风险。", "平順煞車、加速和轉向；降低速度並避免使用定速巡航，以減少水滑風險。", "制動・加速・操舵を滑らかに。減速し、クルーズ制御を避けて水膜現象を抑える。", "부드럽게 제동·가속·조향하고 감속하며 크루즈 컨트롤을 피하세요."],
  ["Remember:", "请记住：", "請記住：", "覚えておくこと：", "기억하세요:"],
  ["The signed limit is a maximum for good conditions—not a target in heavy rain.", "限速标志是在良好条件下的最高速度，不是暴雨中的目标速度。", "速限標誌是在良好條件下的最高速度，不是暴雨中的目標速度。", "制限速度は良好時の上限で、大雨時の目標ではありません。", "제한속도는 좋은 조건에서의 상한이지 폭우 속 목표 속도가 아닙니다."],
  ["If you cannot see enough road to stop within it, you are travelling too fast.", "如果可见道路不足以让你停车，说明你的速度太快。", "如果可見道路不足以讓你停車，說明你的速度太快。", "見える範囲内で止まれないなら速度が高すぎます。", "보이는 거리 안에 멈출 수 없다면 너무 빠른 것입니다."],
  ["High beam reflects from fog and can make it harder to see. Use permitted fog lights only while visibility is poor.", "远光灯会被雾反射并降低视野；仅在能见度差且法规允许时使用雾灯。", "遠光燈會被霧反射並降低視野；僅在能見度差且法規允許時使用霧燈。", "ハイビームは霧で反射します。視界不良時のみ許可されたフォグ灯を使用。", "상향등은 안개에 반사됩니다. 시야가 나쁠 때만 허용된 안개등을 사용하세요."],
  ["Keep windows closed and use air recirculation to reduce dust entering the cabin.", "关闭车窗并使用空气内循环，减少沙尘进入车内。", "關閉車窗並使用空氣內循環，減少沙塵進入車內。", "窓を閉め内気循環にして砂塵の侵入を減らす。", "창문을 닫고 내기 순환을 사용해 먼지 유입을 줄이세요."],
  ["If visibility deteriorates, pull off the traffic lane in a safe place and wait for conditions to improve.", "能见度恶化时，应驶离行车道并在安全地点等待天气改善。", "能見度惡化時，應駛離行車道並在安全地點等待天氣改善。", "視界が悪化したら走行車線を離れ、安全な場所で回復を待つ。", "시야가 나빠지면 차로를 벗어난 안전한 곳에서 개선을 기다리세요."],
  ["You cannot reliably judge the depth, current, debris or road damage beneath floodwater.", "你无法可靠判断洪水的深度、流速、杂物或水下道路损坏。", "你無法可靠判斷洪水的深度、流速、雜物或水下道路損壞。", "冠水の深さ、流れ、漂流物、路面損傷は確実に判断できません。", "침수 깊이, 유속, 잔해와 수면 아래 도로 손상을 정확히 알 수 없습니다."],
  ["Never attempt to drive across a flooded road or bridge—even if the water appears calm or shallow.", "绝不要驶过被淹道路或桥梁，即使水面看起来平静或很浅。", "絕不要駛過被淹道路或橋樑，即使水面看起來平靜或很淺。", "穏やかで浅く見えても冠水した道路や橋を渡らない。", "물이 잔잔하거나 얕아 보여도 침수 도로나 다리를 건너지 마세요."],
  ["Follow closure signs and official directions. Waiting is safer than testing the crossing.", "遵守封路标志和官方指示；等待比冒险尝试通过更安全。", "遵守封路標誌和官方指示；等待比冒險嘗試通過更安全。", "通行止めと公式指示に従う。渡れるか試すより待つ方が安全。", "통제 표지와 공식 지시를 따르세요. 건너기를 시험하는 것보다 기다리는 편이 안전합니다."],
  ["Recently flooded surfaces and bridges may remain damaged, unstable or slippery.", "近期被淹的路面和桥梁仍可能损坏、不稳定或湿滑。", "近期被淹的路面和橋樑仍可能損壞、不穩定或濕滑。", "冠水後の路面や橋は損傷、不安定、滑りやすい可能性があります。", "최근 침수된 도로와 교량은 손상되거나 불안정하고 미끄러울 수 있습니다."],
  ["Non-negotiable:", "不可妥协：", "不可妥協：", "絶対事項：", "절대 원칙:"],
  ["Never drive, walk or ride through floodwater.", "绝不要驾车、步行或骑行穿越洪水。", "絕不要駕車、步行或騎行穿越洪水。", "冠水を車・徒歩・自転車で通過しない。", "차량, 도보, 자전거로 홍수를 통과하지 마세요."],
  ["Strong wind reduces stability; ice and snow reduce tyre grip.", "强风会降低车辆稳定性；结冰和积雪会降低轮胎抓地力。", "強風會降低車輛穩定性；結冰和積雪會降低輪胎抓地力。", "強風は安定性を、氷雪はタイヤのグリップを低下させます。", "강풍은 안정성을, 결빙과 눈은 타이어 접지력을 낮춥니다."],
  ["Check Bureau of Meteorology warnings and road updates; delay travel during severe weather where possible.", "查看气象局预警和道路更新；在严重天气中尽可能延期出行。", "查看氣象局預警和道路更新；在嚴重天氣中盡可能延期出行。", "気象局警報と道路情報を確認し、悪天候時は可能なら延期。", "기상청 경보와 도로 정보를 확인하고 악천후에는 가능한 한 이동을 미루세요."],
  ["Brake early and gently, accelerate slowly and avoid abrupt steering on wet or icy surfaces.", "在湿滑或结冰路面提前轻柔刹车、缓慢加速，并避免突然转向。", "在濕滑或結冰路面提前輕柔煞車、緩慢加速，並避免突然轉向。", "濡れ・凍結路では早めに穏やかに制動し、ゆっくり加速して急操舵を避ける。", "젖거나 언 노면에서는 미리 부드럽게 제동하고 천천히 가속하며 급조향을 피하세요."],
  ["Allow additional space around trucks, trailers and caravans, which can be more affected by wind and require longer stopping distances.", "为卡车、拖车和房车留出更多空间，因为它们更易受风影响且需要更长停车距离。", "為卡車、拖車和露營車留出更多空間，因為它們更易受風影響且需要更長停車距離。", "風の影響を受けやすく停止距離も長いトラック、トレーラー、キャラバンには余裕を。", "바람 영향을 더 받고 정지 거리도 긴 트럭, 트레일러, 카라반 주변에 더 많은 공간을 두세요."],
  ["Exit strategy:", "退出策略：", "退出策略：", "中止の判断：", "중단 전략:"],
  ["If conditions worsen, pull over somewhere safe and wait rather than pushing on.", "天气恶化时，应在安全地点停车等待，而不是勉强继续。", "天氣惡化時，應在安全地點停車等待，而不是勉強繼續。", "悪化したら無理に進まず、安全な場所に停車して待つ。", "상황이 악화되면 무리하지 말고 안전한 곳에 정차해 기다리세요."],
  ["Official guidance used:", "采用的官方指南：", "採用的官方指南：", "使用した公式指針：", "사용한 공식 지침:"],
  ["General education only. Follow current warnings, road closures, emergency services and the road rules in your state or territory.", "仅供一般安全教育。请遵循当前预警、道路封闭、应急服务指示以及所在州或领地的道路规则。", "僅供一般安全教育。請遵循目前預警、道路封閉、緊急服務指示以及所在州或領地的道路規則。", "一般教育用です。最新警報、通行止め、緊急機関、州・準州の規則に従ってください。", "일반 교육용입니다. 최신 경보, 도로 통제, 긴급 기관 및 주·준주의 교통 법규를 따르세요."],
  ["Continue exploring", "继续探索", "繼續探索", "さらに探索", "계속 살펴보기"],
  ["Return to the main explainer →", "返回主页面 →", "返回主頁面 →", "メイン解説へ戻る →", "메인 설명으로 돌아가기 →"],
];

const dynamicRows: Record<string, TranslationRow> = {
  "hazard.ready": ["Start the clip, keep watching the road, then report the first developing hazard.", "开始片段并持续观察道路，然后报告第一个正在形成的危险。", "開始片段並持續觀察道路，然後報告第一個正在形成的危險。", "映像を開始して道路を見続け、最初に発生する危険を報告してください。", "영상을 시작하고 도로를 계속 관찰한 뒤 처음 발생하는 위험을 알려 주세요."],
  "hazard.watching": ["Clip playing—scan the road and do not guess.", "片段播放中——观察道路，请勿猜测。", "片段播放中——觀察道路，請勿猜測。", "再生中—道路を確認し、先読みしないでください。", "영상 재생 중—도로를 살피고 미리 누르지 마세요."],
  "hazard.tryAgain": ["Try another clip", "尝试另一片段", "嘗試另一片段", "別の映像を試す", "다른 영상 시도"],
  "hazard.falseAlarm": ["False alarm—you clicked before a hazard developed. Try again and wait for visible evidence.", "误报——你在危险形成前就点击了。请重试并等待可见迹象。", "誤報——你在危險形成前就點擊了。請重試並等待可見跡象。", "誤報です。危険が発生する前に押しました。見える根拠を待って再挑戦してください。", "오경보입니다. 위험이 발생하기 전에 눌렀습니다. 눈에 보이는 징후를 기다렸다 다시 시도하세요."],
  "hazard.scenario.pedestrian": ["Hazard developing: a pedestrian is entering the road.", "危险形成：一名行人正在进入道路。", "危險形成：一名行人正在進入道路。", "危険発生：歩行者が道路に入っています。", "위험 발생: 보행자가 도로로 들어옵니다."],
  "hazard.scenario.cyclist": ["Hazard developing: a cyclist is crossing your path.", "危险形成：一名骑行者正在穿过你的行驶路线。", "危險形成：一名騎行者正在穿越你的行駛路線。", "危険発生：自転車が進路を横切っています。", "위험 발생: 자전거가 진행 경로를 가로지릅니다."],
  "hazard.scenario.stopped-car": ["Hazard developing: a stopped vehicle is blocking the lane.", "危险形成：一辆停止车辆正在阻挡车道。", "危險形成：一輛停止車輛正在阻擋車道。", "危険発生：停止車両が車線を塞いでいます。", "위험 발생: 정지 차량이 차로를 막고 있습니다."],
  "hazard.rating.sharp": ["Sharp response", "反应敏锐", "反應敏銳", "鋭い反応", "빠른 반응"],
  "hazard.rating.aware": ["Good awareness", "良好的危险意识", "良好的危險意識", "良好な認知", "좋은 인지력"],
  "hazard.rating.delayed": ["Delayed recognition", "识别偏慢", "識別偏慢", "認知が遅れています", "인지가 늦었습니다"],
  "hazard.replay": ["Play a new hazard", "播放新危险片段", "播放新危險片段", "新しい危険を再生", "새 위험 재생"],
  "hazard.result": ["At {speed} km/h, the vehicle travelled {distance} metres before your click.", "以{speed} km/h行驶时，车辆在你点击前已经前进了{distance}米。", "以{speed} km/h行駛時，車輛在你點擊前已經前進了{distance}公尺。", "{speed} km/hでは、クリックまでに車両は{distance}メートル進みました。", "{speed} km/h에서 클릭 전 차량은 {distance}미터 이동했습니다."],
  "hazard.captured": ["Hazard response recorded. Review your result below.", "危险反应已记录，请查看下方结果。", "危險反應已記錄，請查看下方結果。", "危険反応を記録しました。下の結果を確認してください。", "위험 반응을 기록했습니다. 아래 결과를 확인하세요."],
  "reaction.driving": ["Driving… keep watching the road", "车辆行驶中……继续观察道路", "車輛行駛中……繼續觀察道路", "走行中…道路を見続けて", "주행 중…도로를 계속 보세요"],
  "reaction.wait": ["Do not brake until the obstacle appears.", "障碍物出现前不要刹车。", "障礙物出現前不要煞車。", "障害物が現れるまでブレーキを踏まないで。", "장애물이 나타날 때까지 제동하지 마세요."],
  "reaction.go": ["Hazard! Brake now", "危险！立即刹车", "危險！立即煞車", "危険！今すぐブレーキ", "위험! 지금 제동하세요"],
  "reaction.action": ["Click Brake or press the spacebar.", "点击“刹车”或按空格键。", "點擊「煞車」或按空白鍵。", "ブレーキをクリックするかスペースキーを押してください。", "제동 버튼을 누르거나 스페이스바를 누르세요."],
  "reaction.early": ["Too early—you anticipated the hazard.", "太早了——你提前预判了危险。", "太早了——你提前預判了危險。", "早すぎます。危険を予測してしまいました。", "너무 빨랐습니다. 위험을 미리 예측했어요."],
  "reaction.tryAgain": ["Try again", "重新尝试", "重新嘗試", "もう一度", "다시 시도"],
  "reaction.testAgain": ["Test again", "重新测试", "重新測試", "再テスト", "다시 측정"],
  "result.safe": ["Stopped safely", "安全停下", "安全停下", "安全に停止", "안전하게 정지"],
  "result.collision": ["Collision", "发生碰撞", "發生碰撞", "衝突", "충돌"],
  "quiz.correct": ["Correct.", "回答正确。", "回答正確。", "正解。", "정답입니다."],
  "quiz.next": ["Next question", "下一题", "下一題", "次の問題", "다음 문제"],
  "quiz.restart": ["Restart five questions", "重新开始五题", "重新開始五題", "5問を再開", "5문제 다시 시작"],
  "model.wet": ["Wet-road tread adjustment: {value}% of the 8 mm baseline, interpolated from Continental test points.", "湿地胎纹修正：为8毫米基准的{value}%，根据大陆集团测试点插值。", "濕地胎紋修正：為8毫米基準的{value}%，根據馬牌測試點插值。", "濡れた路面の溝補正：8mm基準の{value}%（Continental試験点から補間）。", "젖은 노면 트레드 보정: 8mm 기준의 {value}%, Continental 시험값 보간."],
  "model.dry": ["Dry-road tread adjustment: {value}% of the 8 mm baseline, interpolated from a Tire Rack controlled test. The measured effect was small.", "干地胎纹修正：为8毫米基准的{value}%，根据Tire Rack控制测试插值；实测影响很小。", "乾地胎紋修正：為8毫米基準的{value}%，根據Tire Rack控制測試插值；實測影響很小。", "乾燥路面の溝補正：8mm基準の{value}%（Tire Rack管理試験から補間）。測定された影響は小さい。", "건조 노면 트레드 보정: 8mm 기준의 {value}%, Tire Rack 통제 시험 보간값입니다. 측정 영향은 작습니다."],
  "reaction.seconds": ["You reacted in {value} seconds.", "你的反应时间为{value}秒。", "你的反應時間為{value}秒。", "反応時間は{value}秒でした。", "반응 시간은 {value}초입니다."],
  "result.remaining": ["{value} metres remaining", "剩余{value}米", "剩餘{value}米", "残り{value}メートル", "{value}미터 남음"],
  "result.impact": ["{value} km/h at impact", "碰撞时仍为{value} km/h", "碰撞時仍為{value} km/h", "衝突時{value} km/h", "충돌 시 {value} km/h"],
  "unit.remaining": ["metres remaining", "米余量", "米餘量", "メートルの余裕", "미터 여유"],
  "unit.impact": ["km/h at impact", "km/h（碰撞速度）", "km/h（碰撞速度）", "km/h（衝突時）", "km/h(충돌 시)"],
  "challenge.changed": ["Settings changed", "设置已更改", "設定已更改", "設定を変更しました", "설정이 변경됨"],
  "challenge.retest": ["Test the brakes to reveal the outcome.", "测试刹车以查看结果。", "測試煞車以查看結果。", "ブレーキを試して結果を確認。", "제동을 시험해 결과를 확인하세요."],
  "challenge.safeTitle": ["You stopped before the obstacle.", "你在障碍物前停下了。", "你在障礙物前停下了。", "障害物の手前で停止しました。", "장애물 앞에서 멈췄습니다."],
  "challenge.tightTitle": ["Less than one metre remained.", "剩余距离不到1米。", "剩餘距離不到1米。", "残り1メートル未満でした。", "남은 거리가 1미터 미만입니다."],
  "challenge.collisionTitle": ["The road ran out before your speed did.", "道路已经用完，车速却还没有。", "道路已經用完，車速卻還沒有。", "道路が尽きても速度が残りました。", "도로가 끝났지만 속도는 남았습니다."],
  "challenge.slower": ["Reducing from {speed} km/h to about {target} km/h or less would allow this model to stop before the obstacle.", "从{speed} km/h降至约{target} km/h或更低，模型即可在障碍物前停下。", "從{speed} km/h降至約{target} km/h或更低，模型即可在障礙物前停下。", "{speed} km/hから約{target} km/h以下へ落とせば、モデル上は手前で停止できます。", "{speed} km/h에서 약 {target} km/h 이하로 낮추면 모델상 장애물 앞에 멈출 수 있습니다."],
  "following.safe": ["Enough space: {value} metres remain.", "空间足够：剩余{value}米。", "空間足夠：剩餘{value}米。", "十分な車間：{value}メートル残ります。", "간격 충분: {value}미터 남습니다."],
  "following.unsafe": ["Too close by {value} metres.", "距离不足{value}米。", "距離不足{value}米。", "{value}メートル不足しています。", "{value}미터 부족합니다."],
  "following.required": ["This model needs at least {value} seconds in these conditions.", "这种情况下模型至少需要{value}秒车距。", "這種情況下模型至少需要{value}秒車距。", "この条件では最低{value}秒必要です。", "이 조건에서는 최소 {value}초가 필요합니다."],
  "duel.result": ["The slower car stops. The faster car is still at {impact} km/h.", "较慢车辆已经停下，较快车辆仍为{impact} km/h。", "較慢車輛已經停下，較快車輛仍為{impact} km/h。", "遅い車が停止した時、速い車はまだ{impact} km/hです。", "느린 차가 멈췄을 때 빠른 차는 여전히 {impact} km/h입니다."],
  "duel.extra": ["Just 10 km/h added {value} metres to the stop.", "仅快10 km/h就增加了{value}米停车距离。", "僅快10 km/h就增加了{value}米停車距離。", "わずか10 km/hで停止距離が{value}メートル増加。", "단 10 km/h 차이로 정지 거리가 {value}미터 늘었습니다."],
  "quiz.wrong": ["Not quite: the result is {outcome}.", "不完全正确：实际结果是{outcome}。", "不完全正確：實際結果是{outcome}。", "違います。結果は{outcome}です。", "아쉽습니다. 결과는 {outcome}입니다."],
  "quiz.final": ["Final score: {score} / {total}", "最终得分：{score} / {total}", "最終得分：{score} / {total}", "最終得点：{score} / {total}", "최종 점수: {score} / {total}"],
};

const languageIndex: Record<Language, number> = { en: 0, "zh-CN": 1, "zh-TW": 2, ja: 3, ko: 4 };
const originalTexts = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function storedLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(stored as Language) ? stored as Language : "en";
}

export function currentLanguage(): Language {
  return storedLanguage();
}

function staticTranslation(source: string, language: Language): string {
  if (language === "en") return source;
  const row = rows.find(([english]) => english === source);
  return row?.[languageIndex[language]] ?? source;
}

export function t(key: string, variables: Record<string, string | number> = {}): string {
  const row = dynamicRows[key];
  const template = row?.[languageIndex[currentLanguage()]] ?? key;
  return Object.entries(variables).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function localizeDocument(root: ParentNode = document): void {
  const language = currentLanguage();
  document.documentElement.lang = language;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (parent && !["SCRIPT", "STYLE"].includes(parent.tagName) && node.nodeValue?.trim()) {
      const source = originalTexts.get(node) ?? node.nodeValue;
      originalTexts.set(node, source);
      const trimmed = source.trim();
      const translated = staticTranslation(trimmed, language);
      node.nodeValue = source.replace(trimmed, translated);
    }
    node = walker.nextNode() as Text | null;
  }

  for (const element of root.querySelectorAll?.<HTMLElement>("[aria-label], [title]") ?? []) {
    let originals = originalAttributes.get(element);
    if (!originals) {
      originals = new Map<string, string>();
      originalAttributes.set(element, originals);
    }
    for (const attribute of ["aria-label", "title"]) {
      const value = originals.get(attribute) ?? element.getAttribute(attribute);
      if (!value) continue;
      originals.set(attribute, value);
      element.setAttribute(attribute, staticTranslation(value, language));
    }
  }
}

export function initLanguageSwitcher(): void {
  const selectors = document.querySelectorAll<HTMLSelectElement>("[data-language-select]");
  const language = currentLanguage();
  for (const selector of selectors) {
    selector.value = language;
    selector.addEventListener("change", () => {
      const selected = selector.value as Language;
      if (!SUPPORTED_LANGUAGES.includes(selected)) return;
      localStorage.setItem(STORAGE_KEY, selected);
      for (const peer of selectors) peer.value = selected;
      localizeDocument();
      window.dispatchEvent(new CustomEvent("languagechange"));
    });
  }
  localizeDocument();
}
