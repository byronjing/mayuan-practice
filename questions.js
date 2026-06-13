const KNOWLEDGE_POINTS = [
  {
    id: "intro-components",
    title: "马克思主义的组成",
    chapter: "导论",
    priority: "red",
    correct: "马克思主义由哲学、政治经济学、科学社会主义三部分构成。",
    distractors: [
      "马克思主义只包括哲学和科学社会主义。",
      "马克思主义只是一种经济学理论。",
      "马克思主义由伦理学、法学和美学构成。"
    ],
    falseStatement: "马克思主义只由哲学和政治经济学两部分构成。",
    fillPrompt: "马克思主义由哲学、政治经济学和____三部分构成。",
    fillAnswer: "科学社会主义",
    keywords: ["科学社会主义"],
    explanation: "资料把马克思主义概括为哲学、政治经济学、科学社会主义三部分。",
    sourcePoint: "最 高频主线：马克思主义由哲学、政治经济学、科学社会主义构成。"
  },
  {
    id: "intro-features",
    title: "马克思主义鲜明特征",
    chapter: "导论",
    priority: "red",
    correct: "科学性、人民性、实践性、发展性。",
    distractors: [
      "抽象性、封闭性、空想性、静止性。",
      "经验性、贵族性、神秘性、保守性。",
      "工具性、个人性、偶然性、片面性。"
    ],
    falseStatement: "马克思主义的鲜明特征是封闭性和静止性。",
    fillPrompt: "马克思主义的鲜明特征包括科学性、人民性、实践性和____。",
    fillAnswer: "发展性",
    keywords: ["发展性"],
    explanation: "四个关键词常一起考：科学性、人民性、实践性、发展性。",
    sourcePoint: "导论：鲜明特征：科学性、人民性、实践性、发展性。"
  },
  {
    id: "intro-two-discoveries",
    title: "两个发现",
    chapter: "导论",
    priority: "black",
    correct: "唯物史观和剩余价值学说使社会主义由空想变为科学。",
    distractors: [
      "辩证法和形而上学使社会主义由科学变为空想。",
      "商品经济和市场竞争使社会主义由空想变为科学。",
      "宗教批判和伦理批判使社会主义由空想变为科学。"
    ],
    falseStatement: "商品二因素和劳动二重性使社会主义由空想变为科学。",
    fillPrompt: "使社会主义由空想变为科学的两个发现是唯物史观和____。",
    fillAnswer: "剩余价值学说",
    keywords: ["剩余价值"],
    explanation: "资料明确写到两个发现是唯物史观和剩余价值学说。",
    sourcePoint: "导论补充：两个发现：唯物史观和剩余价值学说。"
  },
  {
    id: "matter-world-unity",
    title: "世界统一于物质",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "red",
    correct: "世界统一于物质，物质决定意识，意识具有能动反作用。",
    distractors: [
      "世界统一于意识，意识直接决定物质。",
      "世界统一于感觉，物质只是感觉的集合。",
      "世界没有统一性，物质和意识互不相关。"
    ],
    falseStatement: "世界统一于意识，物质只是意识的产物。",
    fillPrompt: "唯物主义认为世界统一于____。",
    fillAnswer: "物质",
    keywords: ["物质"],
    explanation: "这是唯物论主线，方法论上要求坚持一切从实际出发。",
    sourcePoint: "最高频主线：世界统一于物质；物质决定意识。"
  },
  {
    id: "matter-definition",
    title: "物质的定义",
    chapter: "名词解释",
    priority: "red",
    correct: "物质是标志客观实在的哲学范畴，唯一特性是客观实在性。",
    distractors: [
      "物质等同于某一种具体实物。",
      "物质是人的主观感觉。",
      "物质是不能运动的实体。"
    ],
    falseStatement: "物质就是看得见摸得着的具体实物。",
    fillPrompt: "物质的唯一特性是____。",
    fillAnswer: "客观实在性",
    keywords: ["客观实在"],
    explanation: "资料特别提醒：物质不是具体实物，而是哲学范畴。",
    sourcePoint: "名词解释：物质标志客观实在，唯一特性是客观实在性。"
  },
  {
    id: "consciousness-role",
    title: "意识的能动作用",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "red",
    correct: "意识不能直接改变客观世界，而是通过指导实践发挥作用。",
    distractors: [
      "意识可以脱离实践直接改变客观世界。",
      "意识没有任何能动作用。",
      "意识决定物质，实践只是意识的附属物。"
    ],
    falseStatement: "意识能够不经过实践而直接改变客观世界。",
    fillPrompt: "意识通过指导____来改造世界。",
    fillAnswer: "实践",
    keywords: ["实践"],
    explanation: "辨析题常考：意识有能动作用，但必须通过实践实现。",
    sourcePoint: "辨析易错句：意识能直接改变客观世界——错。"
  },
  {
    id: "dialectics-general",
    title: "唯物辩证法总特征",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "red",
    correct: "联系和发展是唯物辩证法的总特征。",
    distractors: [
      "孤立和静止是唯物辩证法的总特征。",
      "抽象和神秘是唯物辩证法的总特征。",
      "经验和直观是唯物辩证法的总特征。"
    ],
    falseStatement: "孤立和静止是唯物辩证法的总特征。",
    fillPrompt: "唯物辩证法的总特征是联系和____。",
    fillAnswer: "发展",
    keywords: ["发展"],
    explanation: "联系、发展构成总特征；对立统一规律是实质和核心。",
    sourcePoint: "最高频主线：联系和发展是唯物辩证法总特征。"
  },
  {
    id: "contradiction-core",
    title: "对立统一规律",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "red",
    correct: "对立统一规律是唯物辩证法的实质和核心。",
    distractors: [
      "质量互变规律是唯物辩证法的唯一核心。",
      "否定之否定规律否认矛盾分析法。",
      "形而上学规律是唯物辩证法的实质。"
    ],
    falseStatement: "唯物辩证法的实质和核心是否定一切。",
    fillPrompt: "唯物辩证法的实质和核心是____规律。",
    fillAnswer: "对立统一",
    keywords: ["对立统一"],
    explanation: "资料把对立统一规律、矛盾分析法放在高频核心位置。",
    sourcePoint: "最高频主线：对立统一规律是实质和核心。"
  },
  {
    id: "contradiction-method",
    title: "矛盾分析法",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "red",
    correct: "矛盾分析法是认识和解决问题的根本方法。",
    distractors: [
      "矛盾分析法要求回避矛盾。",
      "矛盾分析法只承认外因，不承认内因。",
      "矛盾分析法就是把所有问题看成一样。"
    ],
    falseStatement: "矛盾分析法要求忽视矛盾双方的对立统一。",
    fillPrompt: "唯物辩证法认识和解决问题的根本方法是____分析法。",
    fillAnswer: "矛盾",
    keywords: ["矛盾"],
    explanation: "答辩证法大题时，矛盾分析法通常是方法论落点。",
    sourcePoint: "最高频主线：矛盾分析法是根本方法。"
  },
  {
    id: "three-laws",
    title: "唯物辩证法三大规律",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "red",
    correct: "对立统一说明动力，量变质变说明状态，否定之否定说明方向和道路。",
    distractors: [
      "对立统一说明数量，量变质变说明阶级，否定之否定说明静止。",
      "三大规律都只说明事物没有发展。",
      "三大规律分别说明感觉、知觉和表象。"
    ],
    falseStatement: "否定之否定规律主要说明事物发展的动力。",
    fillPrompt: "三大规律中，说明事物发展动力的是____规律。",
    fillAnswer: "对立统一",
    keywords: ["对立统一"],
    explanation: "资料给出答题顺序：动力、状态、方向和道路。",
    sourcePoint: "第一章：三大规律答题顺序。"
  },
  {
    id: "inner-outer-cause",
    title: "内因和外因",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "blue",
    correct: "内因是根据，外因是条件，外因通过内因起作用。",
    distractors: [
      "外因是根据，内因只是偶然条件。",
      "内因和外因彼此孤立，不能相互作用。",
      "外因可以不通过内因直接决定一切。"
    ],
    falseStatement: "外因是事物发展的根据，内因只是条件。",
    fillPrompt: "内因是根据，外因是条件，外因通过____起作用。",
    fillAnswer: "内因",
    keywords: ["内因"],
    explanation: "这是一组常考关系题，注意内因和外因的地位不同。",
    sourcePoint: "第一章蓝常考：内因是根据，外因是条件。"
  },
  {
    id: "common-individual",
    title: "共性与个性",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "blue",
    correct: "既不能只讲普遍原则而忽视实际，也不能只讲特殊性而否定普遍规律。",
    distractors: [
      "只要讲普遍原则，就可以不管具体实际。",
      "只要讲特殊性，就可以否定普遍规律。",
      "共性和个性完全无关。"
    ],
    falseStatement: "坚持共性与个性统一，就是只讲共性、不讲个性。",
    fillPrompt: "共性与个性关系要求把普遍原则和____结合起来。",
    fillAnswer: "具体实际",
    keywords: ["具体实际"],
    explanation: "共性与个性统一常用于分析“不能照搬模式”。",
    sourcePoint: "第一章蓝常考：共性与个性。"
  },
  {
    id: "practice-foundation",
    title: "实践是认识的基础",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "red",
    correct: "实践是认识的来源、动力、目的，也是检验认识真理性的唯一标准。",
    distractors: [
      "实践只是认识的结果，不是认识的来源。",
      "书本是检验真理的唯一标准。",
      "认识不需要实践，也不回到实践。"
    ],
    falseStatement: "实践只是检验真理的重要标准之一。",
    fillPrompt: "实践是认识的来源、动力、目的，也是检验真理的____标准。",
    fillAnswer: "唯一",
    keywords: ["唯一"],
    explanation: "“唯一标准”是高频易错点，不能写成重要标准之一。",
    sourcePoint: "第二章红必背：实践是认识的基础。"
  },
  {
    id: "practice-definition",
    title: "实践的定义",
    chapter: "名词解释",
    priority: "red",
    correct: "实践是人类能动改造世界的客观物质性活动。",
    distractors: [
      "实践是纯粹主观想象活动。",
      "实践是不需要主体参与的自然变化。",
      "实践只是书本学习。"
    ],
    falseStatement: "实践是脱离客观世界的纯主观活动。",
    fillPrompt: "实践是人类能动改造世界的____活动。",
    fillAnswer: "客观物质性",
    keywords: ["客观", "物质"],
    explanation: "定义题要抓住人类、能动改造、客观物质性三个词。",
    sourcePoint: "名词解释：实践。"
  },
  {
    id: "cognition-essence",
    title: "认识的本质",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "red",
    correct: "认识是在实践基础上主体对客体的能动反映。",
    distractors: [
      "认识是照镜子式的机械复制。",
      "认识完全脱离主体和实践。",
      "认识只是天生观念的展开。"
    ],
    falseStatement: "认识是照镜子式复制，不包含能动创造。",
    fillPrompt: "认识的本质是主体在实践基础上对客体的____反映。",
    fillAnswer: "能动",
    keywords: ["能动"],
    explanation: "资料强调反映不是机械复制，而是能动反映。",
    sourcePoint: "第二章红必背：认识的本质。"
  },
  {
    id: "cognition-two-leaps",
    title: "认识过程两次飞跃",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "red",
    correct: "认识过程包括从实践到认识、再从认识回到实践两次飞跃。",
    distractors: [
      "认识只停留在感性经验，不需要回到实践。",
      "认识从思想到感觉再到物，完全不需要实践。",
      "认识过程只有一次飞跃，即从概念到概念。"
    ],
    falseStatement: "认识形成后不需要再回到实践。",
    fillPrompt: "认识过程两次飞跃是实践到认识、认识再回到____。",
    fillAnswer: "实践",
    keywords: ["实践"],
    explanation: "认识的目的在于指导实践，第二次飞跃更重要。",
    sourcePoint: "第二章红必背：认识过程两次飞跃。"
  },
  {
    id: "truth-features",
    title: "真理的特性",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "red",
    correct: "真理具有客观性、绝对性和相对性。",
    distractors: [
      "真理只有主观性，没有客观性。",
      "真理只具有绝对性，不具有相对性。",
      "真理只具有相对性，不具有绝对性。"
    ],
    falseStatement: "真理要么都是绝对的，要么都是相对的。",
    fillPrompt: "真理具有客观性、绝对性和____。",
    fillAnswer: "相对性",
    keywords: ["相对"],
    explanation: "任何真理都是绝对性与相对性的统一。",
    sourcePoint: "第二章红必背：真理具有客观性、绝对性和相对性。"
  },
  {
    id: "truth-practice-standard",
    title: "实践检验真理",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "red",
    correct: "实践是检验真理的唯一标准，因为实践具有直接现实性。",
    distractors: [
      "权威意见是检验真理的唯一标准。",
      "多数人的感觉是检验真理的唯一标准。",
      "逻辑自洽必然等于真理，不需要实践检验。"
    ],
    falseStatement: "实践只是检验真理的标准之一，权威也可以作为同等标准。",
    fillPrompt: "实践之所以能检验真理，一个重要原因是实践具有____。",
    fillAnswer: "直接现实性",
    keywords: ["直接", "现实"],
    explanation: "资料明确说实践是唯一标准，由真理本性和实践特点决定。",
    sourcePoint: "第二章红必背：实践是检验真理的唯一标准。"
  },
  {
    id: "truth-value",
    title: "真理尺度和价值尺度",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "red",
    correct: "真理尺度要求按客观规律办事，价值尺度要求符合主体需要，二者在实践中统一。",
    distractors: [
      "真理尺度和价值尺度永远互相排斥。",
      "价值尺度要求完全无视主体需要。",
      "真理尺度要求只看愿望，不看规律。"
    ],
    falseStatement: "真理尺度和价值尺度在实践中不可能统一。",
    fillPrompt: "真理尺度和价值尺度在____中统一。",
    fillAnswer: "实践",
    keywords: ["实践"],
    explanation: "真理和价值不是二选一，而是在实践中统一。",
    sourcePoint: "第二章红必背：价值与真理。"
  },
  {
    id: "sensory-rational",
    title: "感性认识和理性认识",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "blue",
    correct: "感性认识包括感觉、知觉、表象；理性认识包括概念、判断、推理。",
    distractors: [
      "感性认识包括概念、判断、推理。",
      "理性认识包括感觉、知觉、表象。",
      "感性认识和理性认识完全孤立。"
    ],
    falseStatement: "概念、判断、推理属于感性认识。",
    fillPrompt: "理性认识的三种形式是概念、判断和____。",
    fillAnswer: "推理",
    keywords: ["推理"],
    explanation: "这一组常出选择题，要把两组三形式分清。",
    sourcePoint: "第二章蓝常考：感性认识和理性认识三形式。"
  },
  {
    id: "cognition-route",
    title: "认识路线",
    chapter: "第二章 实践与认识及其发展规律",
    priority: "blue",
    correct: "从物到感觉和思想是唯物主义；从思想和感觉到物是唯心主义。",
    distractors: [
      "从物到感觉和思想是唯心主义。",
      "唯物主义认为思想先于物。",
      "唯心主义和唯物主义在认识路线上的差别不存在。"
    ],
    falseStatement: "从思想和感觉到物是唯物主义认识路线。",
    fillPrompt: "从物到感觉和思想是____认识路线。",
    fillAnswer: "唯物主义",
    keywords: ["唯物"],
    explanation: "认识路线题抓住方向：物到思想是唯物主义。",
    sourcePoint: "第二章蓝常考：认识路线。"
  },
  {
    id: "social-existence-consciousness",
    title: "社会存在与社会意识",
    chapter: "第三章 人类社会及其发展规律",
    priority: "red",
    correct: "社会存在决定社会意识，社会意识具有相对独立性并反作用于社会存在。",
    distractors: [
      "社会意识决定社会存在，社会存在没有作用。",
      "社会意识完全没有相对独立性。",
      "社会存在和社会意识没有关系。"
    ],
    falseStatement: "社会意识决定社会存在，社会存在只是观念的结果。",
    fillPrompt: "唯物史观认为，社会存在决定____。",
    fillAnswer: "社会意识",
    keywords: ["社会意识"],
    explanation: "这是社会历史观的基础关系，注意还有社会意识的反作用。",
    sourcePoint: "第三章红必背：社会存在决定社会意识。"
  },
  {
    id: "social-basic-contradictions",
    title: "社会基本矛盾",
    chapter: "第三章 人类社会及其发展规律",
    priority: "red",
    correct: "生产力和生产关系、经济基础和上层建筑的矛盾是社会发展的根本动力。",
    distractors: [
      "个人好恶和自然天气的矛盾是社会发展的根本动力。",
      "社会基本矛盾只包括生产力内部矛盾。",
      "上层建筑决定一切，生产力没有作用。"
    ],
    falseStatement: "社会基本矛盾只有经济基础和上层建筑的矛盾，不包括生产力和生产关系。",
    fillPrompt: "社会基本矛盾包括生产力和生产关系、经济基础和____的矛盾。",
    fillAnswer: "上层建筑",
    keywords: ["上层建筑"],
    explanation: "两对矛盾要成组记忆，是历史唯物主义大题核心。",
    sourcePoint: "第三章红必背：社会基本矛盾。"
  },
  {
    id: "productive-force-relation",
    title: "生产力与生产关系",
    chapter: "第三章 人类社会及其发展规律",
    priority: "red",
    correct: "生产力决定生产关系，生产关系反作用于生产力。",
    distractors: [
      "生产关系决定生产力，生产力没有基础作用。",
      "生产力和生产关系互不影响。",
      "生产关系只属于自然现象。"
    ],
    falseStatement: "生产关系决定生产力，生产力只起反作用。",
    fillPrompt: "生产关系一定要适合____状况。",
    fillAnswer: "生产力",
    keywords: ["生产力"],
    explanation: "答题时常写：生产力决定生产关系，生产关系反作用于生产力。",
    sourcePoint: "第三章红必背：生产力与生产关系矛盾运动。"
  },
  {
    id: "base-superstructure",
    title: "经济基础与上层建筑",
    chapter: "第三章 人类社会及其发展规律",
    priority: "red",
    correct: "经济基础决定上层建筑，上层建筑反作用于经济基础。",
    distractors: [
      "上层建筑决定经济基础，经济基础没有作用。",
      "经济基础只指地理环境。",
      "上层建筑只包括机器设备。"
    ],
    falseStatement: "上层建筑一定决定经济基础，经济基础没有决定作用。",
    fillPrompt: "上层建筑一定要适合____状况。",
    fillAnswer: "经济基础",
    keywords: ["经济基础"],
    explanation: "这组关系与生产力/生产关系常并列考。",
    sourcePoint: "第三章红必背：经济基础与上层建筑矛盾运动。"
  },
  {
    id: "people-history",
    title: "人民群众创造历史",
    chapter: "第三章 人类社会及其发展规律",
    priority: "red",
    correct: "人民群众创造社会物质财富、精神财富，是社会变革的决定力量。",
    distractors: [
      "历史完全由少数英雄任意创造。",
      "人民群众只创造精神财富，不创造物质财富。",
      "人民群众与社会变革没有关系。"
    ],
    falseStatement: "历史由英雄人物单独创造，人民群众不起决定作用。",
    fillPrompt: "人民群众是历史的____。",
    fillAnswer: "创造者",
    keywords: ["创造"],
    explanation: "群众史观不是否认杰出人物作用，而是强调人民群众创造历史。",
    sourcePoint: "最高频主线：人民群众创造历史。"
  },
  {
    id: "mass-line",
    title: "群众路线",
    chapter: "第三章 人类社会及其发展规律",
    priority: "red",
    correct: "群众路线要求一切为了群众、一切依靠群众。",
    distractors: [
      "群众路线要求脱离群众、只依靠少数人。",
      "群众路线只是经济政策，与认识路线无关。",
      "群众路线否认人民群众创造历史。"
    ],
    falseStatement: "群众路线要求一切为了少数人、一切依靠少数人。",
    fillPrompt: "群众路线在实践中要求一切为了群众、____群众。",
    fillAnswer: "一切依靠",
    keywords: ["依靠"],
    explanation: "论述题中群众路线可从群众史观、党的根基、认识路线和工作路线统一展开。",
    sourcePoint: "论述题预测：为什么要坚持群众路线。"
  },
  {
    id: "historical-figure",
    title: "评价历史人物",
    chapter: "第三章 人类社会及其发展规律",
    priority: "blue",
    correct: "评价历史人物要坚持历史分析法和阶级分析法。",
    distractors: [
      "评价历史人物只看个人好恶。",
      "评价历史人物只看单个事件，不看社会条件。",
      "评价历史人物可以脱离阶级立场和历史趋势。"
    ],
    falseStatement: "评价历史人物只需要看个人作用，不需要看社会条件。",
    fillPrompt: "评价历史人物要坚持历史分析法和____分析法。",
    fillAnswer: "阶级",
    keywords: ["阶级"],
    explanation: "资料要求既看个人作用，也看社会条件、阶级立场、人民利益和历史趋势。",
    sourcePoint: "论述题预测：如何评价历史人物。"
  },
  {
    id: "commodity-two-factors",
    title: "商品二因素",
    chapter: "第四章 资本主义的本质",
    priority: "red",
    correct: "商品具有使用价值和价值两个因素。",
    distractors: [
      "商品只有价格，没有价值。",
      "商品只有使用价值，不用于交换。",
      "商品二因素是工资和利润。"
    ],
    falseStatement: "商品只有使用价值，没有价值。",
    fillPrompt: "商品二因素是使用价值和____。",
    fillAnswer: "价值",
    keywords: ["价值"],
    explanation: "商品二因素与劳动二重性是政治经济学核心入口。",
    sourcePoint: "最高频主线：商品二因素与劳动二重性。"
  },
  {
    id: "labor-duality",
    title: "劳动二重性",
    chapter: "第四章 资本主义的本质",
    priority: "red",
    correct: "劳动二重性是理解政治经济学的枢纽。",
    distractors: [
      "劳动二重性只解释自然科学问题。",
      "劳动二重性与商品二因素无关。",
      "劳动二重性是工资和利润的二重性。"
    ],
    falseStatement: "劳动二重性不是理解政治经济学的关键。",
    fillPrompt: "理解政治经济学的枢纽是劳动____。",
    fillAnswer: "二重性",
    keywords: ["二重性"],
    explanation: "资料直接强调劳动二重性是理解政治经济学的枢纽。",
    sourcePoint: "最高频主线：劳动二重性是理解政治经济学的枢纽。"
  },
  {
    id: "value-definition",
    title: "商品价值",
    chapter: "名词解释",
    priority: "red",
    correct: "价值是凝结在商品中的无差别一般人类劳动。",
    distractors: [
      "价值就是商品的自然属性。",
      "价值就是消费者的个人喜好。",
      "价值就是商品的颜色和形状。"
    ],
    falseStatement: "价值是商品满足个人偏好的自然属性。",
    fillPrompt: "商品价值是凝结在商品中的无差别一般____。",
    fillAnswer: "人类劳动",
    keywords: ["人类劳动"],
    explanation: "注意名词解释中“价值”有两个语境：哲学价值和商品价值。",
    sourcePoint: "名词解释：价值，凝结在商品中的无差别一般人类劳动。"
  },
  {
    id: "socially-necessary-labor-time",
    title: "社会必要劳动时间",
    chapter: "第四章 资本主义的本质",
    priority: "blue",
    correct: "商品价值量与社会必要劳动时间成正比，与社会劳动生产率成反比。",
    distractors: [
      "商品价值量与社会必要劳动时间成反比。",
      "商品价值量与社会劳动生产率成正比。",
      "商品价值量完全由个人劳动时间决定。"
    ],
    falseStatement: "商品价值量与社会劳动生产率成正比。",
    fillPrompt: "商品价值量与社会必要劳动时间成____比。",
    fillAnswer: "正",
    keywords: ["正"],
    explanation: "选择题常考正反比：必要劳动时间正比，劳动生产率反比。",
    sourcePoint: "选择题高频细节：商品价值量。"
  },
  {
    id: "surplus-value",
    title: "剩余价值",
    chapter: "第四章 资本主义的本质",
    priority: "red",
    correct: "剩余价值是雇佣工人创造并被资本家无偿占有的超过劳动力价值的价值。",
    distractors: [
      "剩余价值是资本家自己劳动创造的全部价值。",
      "剩余价值是商品使用价值的自然增长。",
      "剩余价值与雇佣劳动无关。"
    ],
    falseStatement: "剩余价值是资本家自己创造并合理独占的价值。",
    fillPrompt: "剩余价值是由雇佣工人创造并被资本家____占有的价值。",
    fillAnswer: "无偿",
    keywords: ["无偿"],
    explanation: "剩余价值生产是资本主义生产的实质。",
    sourcePoint: "最高频主线：剩余价值生产是资本主义生产实质。"
  },
  {
    id: "labor-power-commodity",
    title: "劳动力商品",
    chapter: "第四章 资本主义的本质",
    priority: "red",
    correct: "劳动力成为商品是货币转化为资本的前提。",
    distractors: [
      "土地成为商品是货币转化为资本的唯一前提。",
      "任何商品交换都会自动产生剩余价值。",
      "货币不需要任何条件就能转化为资本。"
    ],
    falseStatement: "货币转化为资本的前提是普通商品价格上涨。",
    fillPrompt: "货币转化为资本的前提是____成为商品。",
    fillAnswer: "劳动力",
    keywords: ["劳动力"],
    explanation: "资本总公式矛盾的解决点在劳动力成为商品。",
    sourcePoint: "最高频主线：劳动力商品是货币转化为资本的前提。"
  },
  {
    id: "capital-formula",
    title: "资本总公式矛盾",
    chapter: "第四章 资本主义的本质",
    priority: "red",
    correct: "G-W-G' 中价值增殖不能从流通本身产生，又离不开流通；解决在劳动力成为商品。",
    distractors: [
      "G-W-G' 中价值增殖完全来自商品等价交换本身。",
      "资本总公式矛盾与劳动力商品无关。",
      "资本总公式说明资本不会增殖。"
    ],
    falseStatement: "资本总公式矛盾说明剩余价值可以直接从等价交换中产生。",
    fillPrompt: "资本总公式矛盾的解决在于____成为商品。",
    fillAnswer: "劳动力",
    keywords: ["劳动力"],
    explanation: "等价交换本身不能产生价值增殖，但资本增殖又离不开流通。",
    sourcePoint: "第四章红必背：资本总公式矛盾。"
  },
  {
    id: "wage-essence",
    title: "工资本质",
    chapter: "第四章 资本主义的本质",
    priority: "blue",
    correct: "工资是劳动力价值或价格的转化形式，不是劳动的价值。",
    distractors: [
      "工资就是劳动本身的价值。",
      "工资与劳动力价值完全无关。",
      "工资证明资本主义不存在剥削。"
    ],
    falseStatement: "工资是劳动的价值，而不是劳动力价值的转化形式。",
    fillPrompt: "工资本质上是____价值或价格的转化形式。",
    fillAnswer: "劳动力",
    keywords: ["劳动力"],
    explanation: "辨析题常考“劳动创造价值，所以工资是劳动价值”这一错误说法。",
    sourcePoint: "辨析易错句：工资是劳动力价值或价格的转化形式。"
  },
  {
    id: "surplus-value-rate",
    title: "剩余价值率",
    chapter: "第四章 资本主义的本质",
    priority: "blue",
    correct: "剩余价值率 m/v 表示剥削程度，利润率 m/(c+v) 掩盖剥削程度。",
    distractors: [
      "剩余价值率 m/(c+v) 表示剥削程度。",
      "利润率比剩余价值率更直接揭示剥削程度。",
      "m/v 与剥削程度无关。"
    ],
    falseStatement: "利润率 m/(c+v) 最直接表示剥削程度。",
    fillPrompt: "表示剥削程度的是剩余价值率____。",
    fillAnswer: "m/v",
    keywords: ["m/v"],
    explanation: "公式题抓住 m/v 和 m/(c+v) 的区别。",
    sourcePoint: "选择题高频细节：剩余价值率和利润率。"
  },
  {
    id: "capital-cycle",
    title: "产业资本循环",
    chapter: "第四章 资本主义的本质",
    priority: "blue",
    correct: "产业资本循环依次经过购买、生产、售卖三个阶段。",
    distractors: [
      "产业资本循环依次经过感觉、知觉、表象。",
      "产业资本循环只包括售卖阶段。",
      "产业资本循环依次经过分配、消费、政治三个阶段。"
    ],
    falseStatement: "产业资本循环只经过生产和售卖两个阶段。",
    fillPrompt: "产业资本循环三阶段是购买、生产和____。",
    fillAnswer: "售卖",
    keywords: ["售卖"],
    explanation: "三阶段对应货币资本、生产资本、商品资本三种职能形式。",
    sourcePoint: "第四章蓝常考：资本循环三阶段。"
  },
  {
    id: "monopoly-inevitability",
    title: "垄断形成的必然性",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "red",
    correct: "生产集中和资本集中发展到一定阶段必然形成垄断。",
    distractors: [
      "垄断是由个人道德选择偶然造成的。",
      "垄断来自封建土地制度，与资本集中无关。",
      "垄断说明生产集中完全消失。"
    ],
    falseStatement: "垄断不是生产集中和资本集中发展的结果。",
    fillPrompt: "自由竞争资本主义发展到垄断资本主义，根源在生产集中和____集中。",
    fillAnswer: "资本",
    keywords: ["资本"],
    explanation: "资料把生产集中、资本集中作为垄断形成的必然原因。",
    sourcePoint: "第五章红必背：自由竞争发展到垄断具有必然性。"
  },
  {
    id: "monopoly-competition",
    title: "垄断与竞争",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "red",
    correct: "垄断没有消除竞争，而是在更高层次、更复杂形式上与竞争并存。",
    distractors: [
      "垄断彻底消灭竞争。",
      "垄断和竞争从来不会同时存在。",
      "垄断只会消除资本主义基本矛盾。"
    ],
    falseStatement: "垄断彻底消灭竞争，因此资本主义不再有竞争。",
    fillPrompt: "垄断没有消除竞争，而是与竞争____。",
    fillAnswer: "并存",
    keywords: ["并存"],
    explanation: "这是一条辨析高频易错句。",
    sourcePoint: "第五章红必背：垄断没有消除竞争。"
  },
  {
    id: "finance-capital",
    title: "金融资本和金融寡头",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "red",
    correct: "工业垄断资本与银行垄断资本融合形成金融资本，金融寡头通过参与制等实现统治。",
    distractors: [
      "金融资本是农业小生产自然形成的资本。",
      "金融寡头只通过劳动竞赛实现统治。",
      "金融资本与银行垄断资本无关。"
    ],
    falseStatement: "金融资本是工业垄断资本和农业家庭劳动融合形成的。",
    fillPrompt: "金融寡头常通过____等方式实现统治。",
    fillAnswer: "参与制",
    keywords: ["参与制"],
    explanation: "金融资本、金融寡头、参与制是一组常考概念。",
    sourcePoint: "第五章红必背：金融资本和金融寡头。"
  },
  {
    id: "state-monopoly",
    title: "国家垄断资本主义",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "red",
    correct: "国家垄断资本主义是国家政权与私人垄断资本结合，不能消除资本主义基本矛盾。",
    distractors: [
      "国家垄断资本主义已经改变资本主义性质。",
      "国家垄断资本主义能彻底消灭资本主义基本矛盾。",
      "国家垄断资本主义与私人垄断资本无关。"
    ],
    falseStatement: "国家垄断资本主义改变了资本主义性质并根除了基本矛盾。",
    fillPrompt: "国家垄断资本主义只能局部调整，不能消除资本主义____。",
    fillAnswer: "基本矛盾",
    keywords: ["基本矛盾"],
    explanation: "资料强调国家垄断资本主义只能缓和，不能根除基本矛盾。",
    sourcePoint: "第五章红必背：国家垄断资本主义。"
  },
  {
    id: "globalization",
    title: "经济全球化",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "red",
    correct: "经济全球化包括生产、贸易、金融、企业经营全球化，具有双重影响。",
    distractors: [
      "经济全球化只包括文化娱乐全球化。",
      "经济全球化没有任何负面影响。",
      "经济全球化完全消除了国际不平等。"
    ],
    falseStatement: "经济全球化只有积极影响，不会加剧不平等和危机传导。",
    fillPrompt: "经济全球化包括生产、贸易、金融和企业经营____。",
    fillAnswer: "全球化",
    keywords: ["全球化"],
    explanation: "评价全球化要写双重影响，不能只写单面。",
    sourcePoint: "第五章红必背：经济全球化。"
  },
  {
    id: "capitalism-replaced",
    title: "社会主义代替资本主义",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "red",
    correct: "资本主义被社会主义代替是历史必然，但过程长期、曲折、复杂。",
    distractors: [
      "资本主义被社会主义代替会一蹴而就。",
      "资本主义没有任何历史地位和进步作用。",
      "社会主义代替资本主义不是历史趋势。"
    ],
    falseStatement: "资本主义被社会主义代替是瞬间完成、没有曲折的过程。",
    fillPrompt: "资本主义被社会主义代替是历史必然，但过程长期、曲折、____。",
    fillAnswer: "复杂",
    keywords: ["复杂"],
    explanation: "资料同时强调历史必然性和过程的长期曲折复杂。",
    sourcePoint: "第五章红必背：资本主义被社会主义代替。"
  },
  {
    id: "new-changes-capitalism",
    title: "当代资本主义新变化",
    chapter: "第五章 资本主义的发展及其趋势",
    priority: "blue",
    correct: "当代资本主义有许多新变化，但没有改变资本主义本质。",
    distractors: [
      "当代资本主义新变化已经消灭资本主义本质。",
      "当代资本主义没有任何调整。",
      "当代资本主义新变化说明剩余价值规律消失。"
    ],
    falseStatement: "当代资本主义新变化已经改变了资本主义本质。",
    fillPrompt: "当代资本主义新变化没有改变资本主义____。",
    fillAnswer: "本质",
    keywords: ["本质"],
    explanation: "新变化可考原因和表现，但结论是没有改变资本主义本质。",
    sourcePoint: "第五章蓝常考：当代资本主义新变化。"
  },
  {
    id: "socialism-scientific",
    title: "社会主义从空想到科学",
    chapter: "第六章 社会主义的发展及其规律",
    priority: "red",
    correct: "唯物史观和剩余价值学说奠定科学社会主义理论基础。",
    distractors: [
      "商品拜物教和利润率奠定科学社会主义理论基础。",
      "主观空想和道德劝说奠定科学社会主义理论基础。",
      "地理环境和人口因素直接奠定科学社会主义理论基础。"
    ],
    falseStatement: "科学社会主义的理论基础是主观空想和道德劝说。",
    fillPrompt: "科学社会主义的理论基础是唯物史观和____。",
    fillAnswer: "剩余价值学说",
    keywords: ["剩余价值"],
    explanation: "这个知识点在导论和社会主义章节都会出现，属于适合重复记忆的核心点。",
    sourcePoint: "第六章红必背：社会主义从空想到科学。"
  },
  {
    id: "october-revolution",
    title: "十月革命",
    chapter: "第六章 社会主义的发展及其规律",
    priority: "red",
    correct: "十月革命建立第一个社会主义国家，开辟人类历史新纪元。",
    distractors: [
      "十月革命标志资本主义制度最终完善。",
      "十月革命与社会主义从理论到现实无关。",
      "十月革命建立的是第一个封建国家。"
    ],
    falseStatement: "十月革命没有使社会主义从理论走向现实。",
    fillPrompt: "十月革命建立第一个____国家。",
    fillAnswer: "社会主义",
    keywords: ["社会主义"],
    explanation: "社会主义从理论到现实的标志性事件是十月革命。",
    sourcePoint: "第六章红必背：社会主义从理论到现实。"
  },
  {
    id: "socialism-long-term",
    title: "社会主义建设长期性",
    chapter: "第六章 社会主义的发展及其规律",
    priority: "red",
    correct: "社会主义建设具有长期性、艰巨性和复杂性。",
    distractors: [
      "社会主义建设可以一蹴而就。",
      "社会主义建设没有任何复杂性。",
      "经济文化相对落后国家只能照搬一种模式。"
    ],
    falseStatement: "社会主义建设在经济文化相对落后国家可以一蹴而就。",
    fillPrompt: "社会主义建设具有长期性、艰巨性和____。",
    fillAnswer: "复杂性",
    keywords: ["复杂"],
    explanation: "这一点和“道路多样性”经常一起理解。",
    sourcePoint: "第六章红必背：社会主义建设长期性、艰巨性和复杂性。"
  },
  {
    id: "socialism-principles",
    title: "科学社会主义基本原则",
    chapter: "第六章 社会主义的发展及其规律",
    priority: "red",
    correct: "包括无产阶级政党领导、公有制主体地位、按劳分配主体地位、人民当家作主等。",
    distractors: [
      "包括私有制绝对统治和少数人当家作主。",
      "包括取消人民民主和共同富裕目标。",
      "包括否认人的自由全面发展。"
    ],
    falseStatement: "科学社会主义基本原则否认人民当家作主。",
    fillPrompt: "社会主义民主的本质是____当家作主。",
    fillAnswer: "人民",
    keywords: ["人民"],
    explanation: "资料中科学社会主义基本原则和社会主义民主本质都强调人民当家作主。",
    sourcePoint: "第六章红必背：科学社会主义基本原则。"
  },
  {
    id: "socialism-path-diversity",
    title: "社会主义道路多样性",
    chapter: "第六章 社会主义的发展及其规律",
    priority: "red",
    correct: "各国国情不同，社会主义发展道路不能照搬模式，必须探索适合本国国情的道路。",
    distractors: [
      "所有国家必须照搬同一种社会主义模式。",
      "社会主义道路多样性否认基本原则。",
      "国情差异与社会主义道路选择无关。"
    ],
    falseStatement: "社会主义发展道路必须照搬同一种固定模式。",
    fillPrompt: "社会主义发展道路多样性要求不能照搬模式，要结合本国____。",
    fillAnswer: "国情",
    keywords: ["国情"],
    explanation: "多样性不是不要原则，而是基本原则同各国国情结合。",
    sourcePoint: "第六章红必背：社会主义发展道路多样性。"
  },
  {
    id: "communism-goal",
    title: "共产主义目标",
    chapter: "共产主义",
    priority: "red",
    correct: "共产主义是人的自由全面发展的社会。",
    distractors: [
      "共产主义是少数人特权发展的社会。",
      "共产主义是一蹴而就的短期事件。",
      "共产主义否认人的自由全面发展。"
    ],
    falseStatement: "共产主义不是长期历史过程，而是一蹴而就。",
    fillPrompt: "共产主义以每个人自由____发展为基本原则。",
    fillAnswer: "全面",
    keywords: ["全面"],
    explanation: "资料最后强调共产主义是人的自由全面发展的社会，并且不是一蹴而就。",
    sourcePoint: "最高频主线：共产主义是人的自由全面发展的社会。"
  },
  {
    id: "major-contradiction-aspect",
    title: "主要矛盾与矛盾主要方面",
    chapter: "辨析易错句",
    priority: "blue",
    correct: "主要矛盾决定发展进程，矛盾主要方面决定事物性质。",
    distractors: [
      "主要矛盾和矛盾主要方面完全一样。",
      "主要矛盾决定事物性质，矛盾主要方面决定发展进程。",
      "二者都只说明商品价格波动。"
    ],
    falseStatement: "主要矛盾和矛盾主要方面是同一个概念。",
    fillPrompt: "主要矛盾决定发展进程，矛盾主要方面决定事物____。",
    fillAnswer: "性质",
    keywords: ["性质"],
    explanation: "这是易混点，适合反复刷：进程对应主要矛盾，性质对应主要方面。",
    sourcePoint: "辨析易错句：主要矛盾不等于矛盾主要方面。"
  },
  {
    id: "price-value",
    title: "价格与价值",
    chapter: "辨析易错句",
    priority: "blue",
    correct: "价格围绕价值波动，不是总是等于价值。",
    distractors: [
      "价格总是严格等于价值。",
      "价值围绕价格随意波动，价值规律不存在。",
      "价格和价值没有任何联系。"
    ],
    falseStatement: "价格总是等于价值。",
    fillPrompt: "价格围绕____波动。",
    fillAnswer: "价值",
    keywords: ["价值"],
    explanation: "辨析题不能写“价格总是等于价值”。",
    sourcePoint: "辨析易错句：价格围绕价值波动。"
  },
  {
    id: "ai-consciousness",
    title: "人工智能与意识",
    chapter: "第一章 世界的物质性及发展规律",
    priority: "black",
    correct: "人工智能可模拟和扩展人的智能活动，但不具有人的社会实践基础和主体意识。",
    distractors: [
      "人工智能已经具有完全等同于人的主体意识。",
      "人工智能不能模拟任何智能活动。",
      "人工智能证明意识可以脱离物质和实践。"
    ],
    falseStatement: "人工智能具有与人完全相同的社会实践基础和主体意识。",
    fillPrompt: "人工智能可模拟智能活动，但不具有人的社会实践基础和____意识。",
    fillAnswer: "主体",
    keywords: ["主体"],
    explanation: "这是补充点，适合用来应对材料题或辨析题。",
    sourcePoint: "第一章黑补充：人工智能与意识。"
  },
  {
    id: "commodity-fetishism",
    title: "商品拜物教",
    chapter: "第四章 资本主义的本质",
    priority: "black",
    correct: "商品拜物教表现为人与人的社会关系表现为物与物的关系。",
    distractors: [
      "商品拜物教表现为物与物的关系还原为自然天气关系。",
      "商品拜物教说明社会关系完全透明。",
      "商品拜物教只说明个人消费偏好。"
    ],
    falseStatement: "商品拜物教说明人与人的社会关系完全不会被物的关系遮蔽。",
    fillPrompt: "商品拜物教表现为人与人的社会关系表现为____的关系。",
    fillAnswer: "物与物",
    keywords: ["物与物"],
    explanation: "这是政治经济学补充点，帮助理解资本主义关系的遮蔽性。",
    sourcePoint: "第四章黑补充：商品拜物教。"
  }
];

const TYPE_PATTERN = [
  "single_choice", "single_choice", "single_choice", "single_choice", "single_choice",
  "single_choice", "single_choice", "single_choice", "single_choice", "single_choice",
  "true_false", "true_false", "true_false", "true_false", "true_false", "true_false",
  "fill_blank", "fill_blank", "fill_blank", "fill_blank"
];

const SET_PLANS = [
  ["intro-components", "matter-world-unity", "dialectics-general", "contradiction-core", "practice-foundation", "truth-practice-standard", "social-existence-consciousness", "people-history", "commodity-two-factors", "surplus-value", "matter-definition", "consciousness-role", "major-contradiction-aspect", "price-value", "monopoly-competition", "state-monopoly", "intro-features", "practice-foundation", "productive-force-relation", "labor-power-commodity"],
  ["intro-features", "three-laws", "inner-outer-cause", "practice-definition", "cognition-two-leaps", "truth-features", "social-basic-contradictions", "productive-force-relation", "labor-duality", "capital-formula", "truth-practice-standard", "sensory-rational", "wage-essence", "monopoly-competition", "new-changes-capitalism", "socialism-path-diversity", "contradiction-core", "social-existence-consciousness", "surplus-value", "communism-goal"],
  ["intro-two-discoveries", "matter-definition", "consciousness-role", "common-individual", "cognition-essence", "truth-value", "base-superstructure", "mass-line", "value-definition", "surplus-value-rate", "practice-foundation", "truth-features", "people-history", "commodity-two-factors", "globalization", "capitalism-replaced", "dialectics-general", "truth-practice-standard", "social-basic-contradictions", "wage-essence"],
  ["matter-world-unity", "contradiction-method", "three-laws", "cognition-route", "sensory-rational", "truth-practice-standard", "historical-figure", "productive-force-relation", "labor-power-commodity", "capital-cycle", "practice-foundation", "base-superstructure", "price-value", "state-monopoly", "socialism-scientific", "october-revolution", "matter-definition", "cognition-two-leaps", "commodity-two-factors", "monopoly-competition"],
  ["intro-components", "dialectics-general", "contradiction-method", "practice-foundation", "truth-features", "social-existence-consciousness", "people-history", "socially-necessary-labor-time", "surplus-value", "monopoly-inevitability", "consciousness-role", "cognition-essence", "productive-force-relation", "wage-essence", "globalization", "socialism-long-term", "intro-features", "contradiction-core", "truth-practice-standard", "state-monopoly"],
  ["intro-features", "matter-world-unity", "inner-outer-cause", "truth-value", "social-basic-contradictions", "mass-line", "value-definition", "capital-formula", "finance-capital", "new-changes-capitalism", "practice-foundation", "cognition-route", "base-superstructure", "commodity-two-factors", "monopoly-competition", "communism-goal", "october-revolution", "truth-features", "labor-power-commodity", "socialism-principles"],
  ["practice-definition", "contradiction-core", "common-individual", "practice-foundation", "sensory-rational", "truth-practice-standard", "people-history", "finance-capital", "surplus-value-rate", "capitalism-replaced", "matter-definition", "cognition-two-leaps", "major-contradiction-aspect", "price-value", "state-monopoly", "socialism-path-diversity", "dialectics-general", "social-existence-consciousness", "surplus-value", "globalization"],
  ["intro-two-discoveries", "matter-world-unity", "three-laws", "cognition-essence", "truth-features", "social-basic-contradictions", "productive-force-relation", "labor-duality", "monopoly-inevitability", "socialism-scientific", "practice-foundation", "people-history", "wage-essence", "socialism-principles", "socialism-long-term", "communism-goal", "intro-features", "truth-practice-standard", "base-superstructure", "labor-power-commodity"]
];

const singlePromptVariants = [
  "以下哪项最符合“{title}”？",
  "关于“{title}”，正确说法是：",
  "复习到“{title}”时，应优先记住哪一项？",
  "下列哪一项可以作为“{title}”的标准表述？"
];

const trueFalsePromptVariants = [
  "判断正误：{statement}",
  "这句话是否正确？{statement}",
  "辨析速判：{statement}",
  "期末易错句判断：{statement}"
];

function deterministicShuffle(items, seed) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = (seed + index * 7 + result[index].length) % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeSingleChoice(point, setIndex, questionIndex) {
  const prompt = singlePromptVariants[(setIndex + questionIndex) % singlePromptVariants.length].replace("{title}", point.title);
  const options = deterministicShuffle([point.correct, ...point.distractors], setIndex * 31 + questionIndex * 17);
  const answer = String.fromCharCode(65 + options.indexOf(point.correct));

  return { prompt, options, answer };
}

function makeTrueFalse(point, setIndex, questionIndex) {
  const useTrue = (setIndex + questionIndex) % 2 === 0;
  const statement = useTrue ? point.correct : point.falseStatement;
  const prompt = trueFalsePromptVariants[(setIndex + questionIndex) % trueFalsePromptVariants.length].replace("{statement}", statement);

  return {
    prompt,
    options: ["正确", "错误"],
    answer: useTrue ? "正确" : "错误"
  };
}

function makeFillBlank(point) {
  return {
    prompt: point.fillPrompt,
    options: [],
    answer: point.fillAnswer
  };
}

function buildQuestions() {
  const pointMap = new Map(KNOWLEDGE_POINTS.map((point) => [point.id, point]));
  return SET_PLANS.flatMap((plan, setIndex) => plan.map((knowledgeId, questionIndex) => {
    const point = pointMap.get(knowledgeId);
    const type = TYPE_PATTERN[questionIndex];
    const body = type === "single_choice"
      ? makeSingleChoice(point, setIndex, questionIndex)
      : type === "true_false"
        ? makeTrueFalse(point, setIndex, questionIndex)
        : makeFillBlank(point);

    return {
      id: `S${setIndex + 1}-${String(questionIndex + 1).padStart(2, "0")}`,
      set: setIndex + 1,
      type,
      chapter: point.chapter,
      priority: point.priority,
      knowledgeId: point.id,
      title: point.title,
      keywords: point.keywords,
      explanation: point.explanation,
      sourcePoint: point.sourcePoint,
      ...body
    };
  }));
}

window.KNOWLEDGE_POINTS = KNOWLEDGE_POINTS;
window.QUESTIONS = buildQuestions();
