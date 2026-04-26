export type DepartmentSlug =
  | "chairman"
  | "qingnian"
  | "wenwen"
  | "office"
  | "tech"
  | "life"
  | "propaganda"
  | "study"
  | "org";

export type Member = {
  name: string;
  title: string;
  studentId?: string;
};

export type Department = {
  slug: DepartmentSlug;
  name: string;
  shortName: string;
  description: string;
  intro: string[];
  functions: string[];
  members: Member[];
};

export const DEPARTMENTS: Department[] = [
  {
    slug: "chairman",
    name: "主席团",
    shortName: "主席团",
    description: "学生会核心领导团队，统筹协调各部门工作。",
    intro: ["主席团是学生会的最高决策机构，负责学生会的全面工作规划和统筹协调。"],
    functions: ["制定工作计划与决策", "统筹各部门协调运转", "对外交流与合作", "监督各部门工作执行"],
    members: [
      { name: "都静雯", title: "主席" },
      { name: "陈爱琳", title: "副主席" },
      { name: "张婧熙", title: "副主席" },
      { name: "樊晋辉", title: "副主席" },
      { name: "李瞳", title: "副主席" },
    ],
  },
  {
    slug: "qingnian",
    name: "青年志愿者协会（青协）",
    shortName: "青协",
    description: "以志愿服务为核心，组织多样化校园公益活动。",
    intro: ["坚持以服务为宗旨，凝聚青年力量，传递温暖与正能量。"],
    functions: ["志愿活动策划与执行", "对接校内外志愿资源", "志愿者培训与管理", "公益项目宣传与总结"],
    members: [
      { name: "傅思程", title: "负责人", studentId: "2024212843" },
      { name: "晏强", title: "负责人", studentId: "2024212480" },
      { name: "童星悦", title: "负责人", studentId: "2024212490" },
      { name: "张嘉艺", title: "负责人", studentId: "2024212657" },
    ],
  },
  {
    slug: "wenwen",
    name: "文体部",
    shortName: "文体",
    description: "负责校园文化与体育活动，提升同学综合素养。",
    intro: ["坚持文化立心、体育铸魂，组织高质量文体活动。"],
    functions: ["文艺与体育活动策划", "赛事组织与承办协同", "节目/海报/宣传支持", "活动氛围建设"],
    members: [
      { name: "钱治宇", title: "负责人", studentId: "2024212590" },
      { name: "张竞翔", title: "负责人", studentId: "2024212638" },
      { name: "王思嘉", title: "负责人", studentId: "2024212489" },
      { name: "耿佳迪", title: "负责人", studentId: "2024212592" },
    ],
  },
  {
    slug: "office",
    name: "办公室",
    shortName: "办公室",
    description: "保障学生会日常运转，统筹物资与行政协同。",
    intro: ["负责制度建设、会议统筹与物资管理，推动学生会工作高效运行。"],
    functions: ["会议组织与材料归档", "物资管理与流程支持", "对外协同联络", "活动保障与风险协同"],
    members: [
      { name: "马煜桢", title: "负责人", studentId: "2024212508" },
      { name: "胡宇航", title: "负责人", studentId: "2024212650" },
    ],
  },
  {
    slug: "tech",
    name: "科技社团",
    shortName: "科技社团",
    description: "面向同学开展科技创新活动，推动学术与实践结合。",
    intro: ["以创新实践为导向，组织科技交流与竞赛支持。"],
    functions: ["科技讲座与交流", "竞赛报名与培训组织", "成果展示与孵化", "技术社群运营"],
    members: [
      { name: "陈梦瑶", title: "负责人", studentId: "2024212656" },
      { name: "刘冠宇", title: "负责人", studentId: "2024212606" },
      { name: "王功杪", title: "负责人", studentId: "2024212565" },
    ],
  },
  {
    slug: "life",
    name: "生活权益部",
    shortName: "生活权益",
    description: "关注同学生活与权益，推动服务落地与问题反馈闭环。",
    intro: ["以同学需求为中心，开展生活服务与权益保障相关工作。"],
    functions: ["诉求收集与反馈协调", "生活服务活动策划", "权益宣讲与合规提示", "服务评估与改进"],
    members: [
      { name: "廖佳", title: "负责人", studentId: "2024212660" },
      { name: "吴俊杰", title: "负责人", studentId: "2024212814" },
    ],
  },
  {
    slug: "propaganda",
    name: "宣传部",
    shortName: "宣传",
    description: "负责学生会对外宣传与内容运营，打造高校官网形象。",
    intro: ["坚持内容为本、设计为翼，做好信息传播与品牌建设。"],
    functions: ["海报/视频/图文内容制作", "活动宣传与舆情整理", "官网与新媒体运营", "视觉规范与素材管理"],
    members: [
      { name: "李欣泽", title: "负责人", studentId: "2024212574" },
      { name: "周园恒", title: "负责人", studentId: "2024212683" },
      { name: "何亮", title: "负责人", studentId: "2024212577" },
      { name: "柴威宇", title: "负责人", studentId: "2024212551" },
      { name: "李佳函", title: "负责人", studentId: "2024212563" },
    ],
  },
  {
    slug: "study",
    name: "学习部",
    shortName: "学习部",
    description: "组织学习交流与学术活动，营造良好学习氛围。",
    intro: ["以学风建设为抓手，搭建经验交流与成长平台。"],
    functions: ["学习经验分享与讲座", "学业辅导资源整合", "学习打卡/活动组织", "学习氛围与成果展示"],
    members: [
      { name: "胡鑫涛", title: "负责人", studentId: "2024212784" },
      { name: "邢媛媛", title: "负责人", studentId: "2024212461" },
      { name: "李佳源", title: "负责人", studentId: "2024212544" },
    ],
  },
  {
    slug: "org",
    name: "组织部",
    shortName: "组织部",
    description: "负责团队组织建设与工作协同，保障活动流程顺畅。",
    intro: ["坚持规范管理，提升组织能力与执行效率。"],
    functions: ["招新/考核/培训组织", "流程制度与执行协同", "志愿与成员管理", "档案整理与复盘"],
    members: [
      { name: "董欣萤", title: "负责人", studentId: "2024212542" },
      { name: "曾籍毅", title: "负责人", studentId: "2024212468" },
      { name: "王梓涵", title: "负责人", studentId: "2024212460" },
      { name: "陈昱宏", title: "负责人", studentId: "2024212546" },
    ],
  },
];

export type Notice = {
  id: string;
  title: string;
  date: string; // ISO
  summary: string;
  content: string[];
};

export const NOTICES: Notice[] = [
  {
    id: "n1",
    title: "关于学生会招新与报名的通知",
    date: "2026-03-20",
    summary: "报名入口、资格要求与审核流程说明。",
    content: [
      "本次招新面向全体在校同学，鼓励有志青年积极参与。",
      "请按要求提交材料，审核通过后将进行面试与综合评估。",
      "后续培训与岗位安排将另行通知。",
    ],
  },
  {
    id: "n2",
    title: "校园公益活动动员会召开",
    date: "2026-03-12",
    summary: "青协与相关部门协同推进公益服务工作。",
    content: [
      "动员会围绕活动流程、分工协作与安全要求展开说明。",
      "现场发放志愿服务指南，并对报名人员进行简要培训。",
    ],
  },
  {
    id: "n3",
    title: "学生会2026年度工作计划征集",
    date: "2026-03-08",
    summary: "欢迎同学围绕文化、学习与服务提出建议。",
    content: [
      "我们将收集并整理同学建议，纳入年度工作计划与活动方向。",
      "建议提交截止时间以公告为准。",
    ],
  },
  {
    id: "n4",
    title: "部门活动宣传素材规范（V1.0）",
    date: "2026-02-25",
    summary: "宣传部发布统一视觉规范与模板下载说明。",
    content: [
      "为保证高校官网视觉一致性，统一采用蓝红配色体系与字体规范。",
      "请各部门按模板进行设计与审核提交。",
    ],
  },
];

