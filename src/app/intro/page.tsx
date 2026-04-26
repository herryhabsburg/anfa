import Link from "next/link";

export default function IntroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">学生会介绍</h1>
        <div className="text-sm text-zinc-500 mt-2">重庆邮电大学网络空间安全与信息法学院学生会官网</div>
      </div>

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <div className="text-sm font-semibold">我们的使命</div>
        </div>
        <div className="p-5 text-sm text-zinc-700 leading-relaxed space-y-3">
          <p>我们以服务同学、凝聚力量、共建校园为宗旨，围绕学习成长、文化活动与权益保障开展工作。</p>
          <p>通过部门协同与规范化运营，持续提升活动质量与服务效率，打造简洁高效、积极向上的学生组织形象。</p>
          <p>
            如需了解各部门职能与成员信息，请进入{" "}
            <Link href="/departments" className="text-blue-700 hover:underline">
              部门介绍
            </Link>
            。
          </p>
        </div>
      </section>
    </div>
  );
}

