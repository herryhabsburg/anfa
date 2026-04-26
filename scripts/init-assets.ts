import { prisma } from "@/lib/prisma";

// 新的物资列表
const newAssets = [
  { name: "活动横幅", quantity: 19 },
  { name: "安法学院小旗帜", quantity: 25 },
  { name: "绿色短袖工作服", quantity: 14 },
  { name: "网络安全宣传周纸袋", quantity: 47 },
  { name: "学生手册", quantity: 29 },
  { name: "重庆邮电大学新生布袋", quantity: 20 },
  { name: "安法学院塑料院徽", quantity: 15 },
  { name: "绿色工作马甲", quantity: 34 },
  { name: "蓝色工作马甲", quantity: 5 },
  { name: "毕业帽", quantity: 25 },
  { name: "安法学院塑料袋", quantity: 16 },
  { name: "蓝色安法学院短袖", quantity: 12 },
  { name: "塑料巴掌（散装）", quantity: 136 },
  { name: "塑料玩具（封装）", quantity: 19 },
  { name: "黑色安法短袖", quantity: 26 },
  { name: "安法学生笔记本", quantity: 405 },
  { name: "白色安法短袖", quantity: 12 },
  { name: "白色安法长袖", quantity: 50 },
  { name: "红色志愿马甲", quantity: 103 },
  { name: "安法学院院徽（亚克力）", quantity: 17 },
  { name: "3袋气球，3个打气筒，1包细丝带，一袋药品，半箱红牛，一箱一次性湿巾，两盒书签，一盒明信片，两包湿巾纸，3张院旗，一面获奖锦旗，3个箭筒，一筒箭", quantity: 1 }
];

async function main() {
  try {
    // 创建默认分类
    let defaultCategory = await prisma.category.findFirst({ where: { name: "默认分类" } });
    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({ data: { name: "默认分类" } });
      console.log("创建默认分类成功");
    }

    // 删除所有物资
    await prisma.asset.deleteMany();
    console.log("删除所有物资成功");

    // 为每个物资创建初始库存记录
    for (const assetData of newAssets) {
      // 创建物资
      const asset = await prisma.asset.create({
        data: {
          name: assetData.name,
          categoryId: defaultCategory.id
        }
      });

      // 创建初始库存记录
      await prisma.stock.create({
        data: {
          assetId: asset.id,
          quantity: assetData.quantity,
          type: "IN",
          reason: "初始化库存"
        }
      });

      console.log(`添加物资: ${assetData.name} (数量: ${assetData.quantity})`);
    }

    console.log("物资初始化完成");
  } catch (error) {
    console.error("初始化失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
