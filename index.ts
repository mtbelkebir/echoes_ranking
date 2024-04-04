import dotenv from "dotenv";
import connectionPool from "./src/db";
import ObjectsToCsv from "objects-to-csv";
dotenv.config();

const points = [25, 18, 15, 12, 10, 8, 6, 4, 3, 2, 1]; // These numbers come from F1 (or maybe not)

async function getRanking(chapterId: string) {
  let conn = await connectionPool.getConnection();
  let results = await conn.query("SELECT * FROM Submits WHERE chapterId = ?", [
    chapterId,
  ]);
  let peopleWhoDidntSubmitShameOnThem = await conn.query(
    "SELECT id as teamId FROM Team WHERE id NOT IN (SELECT teamId FROM Submits WHERE chapterId = ?)", [chapterId]
  );
  peopleWhoDidntSubmitShameOnThem.forEach((value: any) => {
    value.chapterId = chapterId;
    value.date = 0;
    value.points = 0;
  });

  results = [].concat(results, peopleWhoDidntSubmitShameOnThem);
  results.forEach((value: any, index: number) => {
    value.points = index < points.length && value.date != 0 ? points[index] : 1;
  });

  results.forEach((value: any) => (value.points -= 1));
  return results;
}

let ch1Rankings = await getRanking("1");
let ch2Rankings = await getRanking("2");
let ch3Rankings = await getRanking("3");


// Now Ch1ranking becomes the ranking as a whole
ch1Rankings.forEach((v: any) => {
  v.points =
    v.points +
    ch2Rankings.filter((r: any) => r.teamId == v.teamId)[0].points +
    ch3Rankings.filter((r: any) => r.teamId == v.teamId)[0].points;
});



ch1Rankings.sort((a: any, b: any) => b.points - a.points);

// Remove the unnecessary attributes from the objects
ch1Rankings = ch1Rankings.map((obj: any) => {
    const { teamId, points } = obj;
    return { teamId, points };
});

ch1Rankings.forEach((value, index) => {
    value.rank = index + 1;
});

await (async () => {
    const csv = new ObjectsToCsv(ch1Rankings);

    await csv.toDisk("out/test.csv", {
        append: false,
    });
    console.log(await csv.toString());
})();


