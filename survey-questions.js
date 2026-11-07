/* Shared question bank: used by the questionnaire page and the admin page. Question ids are stable; do not reuse an id for a different question. */
/* Partner-facing questions. Internal notes, our price points and post-interview analysis are intentionally left out. */
globalThis.SURVEY_SECTIONS = [
 {id:"s1",en:"Your business and clients",zh:"贵公司与客户",qs:[
  {id:"q1",en:"If you don't mind sharing, how many technicians are on your team, and which parts of Auckland (or beyond) do you usually cover?",zh:"方便的话，想了解一下：贵公司有几位技术人员？平时主要覆盖奥克兰哪些区域（或奥克兰以外）？"},
  {id:"q2",en:"Roughly how many client stores do you look after, and how many new installs do you do in a typical year? A rough range is perfectly fine.",zh:"大约服务多少家门店？一年大概新装多少家？给个大致范围就可以。"},
  {id:"q3",en:"Roughly how are your clients spread across supermarkets, convenience stores, restaurants, cafés, bubble tea and quick-service shops, other retail, and anything else?",zh:"您的客户大致是怎样的业态分布：超市、便利店、餐厅、咖啡馆、奶茶店和快餐店、其他零售，以及其他？"},
  {id:"q3b",en:"Among your food and drink clients, about how many order and pay at the counter (pay first), and how many use table service (pay after the meal)?",zh:"在您的餐饮客户里，大约有多少是在柜台点单、先付款的，多少是服务员点单、吃完再付的？"},
  {id:"q4",en:"Roughly what share of your clients are Asian-owned, and which language do they usually prefer for training and support?",zh:"客户中亚洲业主大约占多少？他们在培训和售后时一般习惯用哪种语言？"}]},
 {id:"s2",en:"What your clients use today",zh:"客户现在用的POS",qs:[
  {id:"q5",en:"Which POS systems do you install or support today? I have seen Moni, SIPO, Idealpos and Lightspeed on your website, so please correct me if I am missing any. Roughly how many shops use each?",zh:"您目前安装或维护哪些POS？我在贵公司网站上看到有 Moni、SIPO、Idealpos 和 Lightspeed，如有遗漏请您指正。各自大约有多少家门店在用？"},
  {id:"q6",en:"Which POS systems do your food and drink clients (especially bubble tea and quick-service shops) use most?",zh:"您的餐饮客户（尤其是奶茶店和快餐店）最常用哪些POS？"},
  {id:"q7",en:"I saw the Shoptech × Moni 2026 winter package advertised at NZ$99 + GST a month over 36 months. Could you tell me whether it still applies, what equipment and services it includes, and what is charged separately? And how are other systems usually rented?",zh:"我看到贵公司与 Moni 合作的 2026 年冬季套餐标注为每月 NZ$99 + GST、租期 36 个月。方便介绍一下目前是否仍适用、包含哪些设备和服务、哪些费用另计吗？其他系统的租用方式又通常是怎样的？"},
  {id:"q7b",en:"If a shop would like to change POS while still within its rental term, what has worked in your experience (for example swapping the system, taking over the remaining payments, or waiting until the term ends)? There is no need to share any contract details.",zh:"如果有门店想在租期内更换POS，据您的经验有哪些做法可行（比如更换系统、承接剩余租金、等租期结束）？不需要透露任何合同细节。"},
  {id:"q8",en:"In your experience, what makes your clients choose a POS or decide to switch?",zh:"据您的经验，客户选择或更换POS，最主要是出于什么原因？"},
  {id:"q9",en:"Which problems with current systems tend to take up most of your support time?",zh:"现有系统的哪些问题，通常最占用您的售后时间？"}]},
 {id:"s3",en:"Hardware and supply",zh:"硬件与供货",qs:[
  {id:"q10",en:"Roughly what share of your clients' counters use Android all-in-one terminals, iPads or Windows touchscreens?",zh:"您客户的收银台大致有多少用安卓一体机、iPad、Windows 触摸屏？"},
  {id:"q11",en:"Which terminal brands (such as iMin, Sunmi, Elo or Posiflex) do you like to install, and what do you like about them?",zh:"您比较愿意安装哪些一体机品牌（如 iMin、商米、Elo、Posiflex）？它们好在哪里？"},
  {id:"q12",en:"Only if you are comfortable sharing: what price ranges should I keep in mind for an all-in-one terminal, kitchen printer, label printer, cash drawer and EFTPOS terminal for our pilot shops?",zh:"如果您方便分享：为试点门店配置一体机、厨房打印机、标签机、钱箱和 EFTPOS 机，各项我大概应该按怎样的价格区间来规划？"},
  {id:"q13",en:"Which parts fail most often, and how do you usually handle warranty, swaps and spare units?",zh:"哪些部件最常出问题？保修、换机和备用机一般是怎么处理的？"},
  {id:"q14",en:"For cup and item labels, which printers and label sizes have worked well for you?",zh:"杯贴和商品标签方面，哪些打印机和标签尺寸用起来比较好？"}]},
 {id:"s4",en:"Payment terminals",zh:"支付终端",qs:[
  {id:"q15",en:"Which payment providers and terminals do your clients use (for example Windcave, Worldline, Verifone or Smartpay)?",zh:"您的客户用哪些支付服务商和终端（比如 Windcave、Worldline、Verifone、Smartpay）？"},
  {id:"q16",en:"Roughly what share of your clients have card payments connected to the POS, and what keeps the others from connecting?",zh:"大约多少客户的刷卡已经和POS集成？其余的没集成，主要是什么原因？"},
  {id:"q17",en:"When you set up integrated payments, what tends to go wrong most often, and who do you usually contact at the payment provider?",zh:"安装集成支付时，通常最容易出什么问题？在支付服务商那边一般找谁对接？"},
  {id:"q17b",en:"Have you worked with Eftpos NZ (Verifone) or Smartpay integrations? If so, roughly how long did setup and approval take?",zh:"您有没有做过 Eftpos NZ（Verifone）或 Smartpay 的集成？如果有，开通和审批大概花了多长时间？"}]},
 {id:"s5",en:"Installation and support",zh:"安装与售后",qs:[
  {id:"q18",en:"Could you walk me through a typical install: the steps, the time on site, and who enters the menu?",zh:"能否请您介绍一下一次典型的安装：步骤、现场需要多久、菜单由谁录入？"},
  {id:"q19",en:"How often do shop networks drop out, and what backup do you usually set up?",zh:"门店网络多久会断一次？您通常会配置什么备份方案？"},
  {id:"q20",en:"What are the most common reasons shops call you, and how quickly can you usually respond on weekdays, evenings and weekends?",zh:"门店最常因为什么事情联系您？工作日、晚上和周末，通常多久能响应？"},
  {id:"q21",en:"In your experience, which printer connection (network, USB or Bluetooth) has been the most reliable?",zh:"据您的经验，哪种打印机连接方式（网口、USB、蓝牙）最稳定？"}]},
 {id:"s6",en:"Bundled services",zh:"打包服务",qs:[
  {id:"q22",en:"Which of your other services (network, CCTV, digital menu boards, electronic shelf labels) do food and drink shops often ask for alongside a POS?",zh:"餐饮店在装POS时，还常会一起问到您的哪些服务（网络、CCTV、数字菜单屏、电子价签）？"},
  {id:"q23",en:"Would you be open to offering our POS together with your other services as a bundle? If so, how do you imagine packaging it?",zh:"您是否愿意把我们的POS和您的其他服务打包提供？如果愿意，您设想怎样组合？"}]},
 {id:"s7",en:"Product planning",zh:"产品规划",qs:[
  {id:"q24",en:"What do bubble tea and quick-service shops most need that current systems do not do so well?",zh:"奶茶店和快餐店最需要、但现有系统做得不太好的是什么？"},
  {id:"q24b",en:"For these shops, which features would you like us to get right first?",zh:"针对这些门店，您希望我们的系统优先做好哪些功能？"},
  {id:"q25",en:"The core features I am planning are integrated card payments on Android terminals, one label per cup, bilingual Chinese/English, careful handling when a card payment result is unclear, and local on-site support. How would you rank them for your clients, and is anything missing?",zh:"我计划的核心功能是：安卓一体机集成刷卡、每杯一张杯贴、中英双语、刷卡结果不明时的稳妥处理，以及本地上门支持。就您的客户而言，您会怎样给它们排序？还有什么遗漏吗？"},
  {id:"q26",en:"I am thinking of offering the system as a rental covering both hardware and software, similar to current business rentals. Do your clients tend to prefer renting or buying outright, and what would make our rental attractive to them?",zh:"我打算以租用方式提供（含硬件和软件），与现有 business rental 类似。您的客户更倾向租还是直接购买？怎样的租用方案会更吸引他们？"},
  {id:"q27",en:"What would help you feel confident installing and recommending the system (for example training, documentation, test units or a direct support line)?",zh:"要让您放心地安装和推荐这套系统，哪些支持会有帮助（比如培训、资料、测试机、直接的技术支持渠道）？"}]},
 {id:"s8",en:"How we work together",zh:"合作方式",qs:[
  {id:"q28",en:"I would love to work together on on-site installation and first-line support. How would you imagine dividing the work between us, and what kind of fees (per install or per month) would feel fair to you?",zh:"我很希望能和您一起承担现场安装和一线售后。您觉得我们怎样分工比较合适？按次或按月怎样收费，您会觉得合理？"},
  {id:"q29",en:"For referrals or resale, what arrangement would feel comfortable for you (a one-off fee, a share of the monthly fee, or something else)?",zh:"关于客户推荐或代理，您觉得怎样的安排比较合适（一次性费用、月费分成，或其他方式）？"},
  {id:"q30",en:"Which of your clients might be open to a free pilot, and how could we approach them together? When would suit you best, for example some time next year?",zh:"您的哪些客户可能愿意参加免费试点？我们可以怎样一起去沟通？什么时候对您比较合适，比如明年的某个时间？"},
  {id:"q31",en:"How would you like us to keep in touch day to day (contact person, channel, regular check-ins)? And is there anything else you would like me to know?",zh:"日常怎样保持联系您会觉得方便（对接人、渠道、定期碰头）？还有什么想让我了解的吗？"}]}
];
