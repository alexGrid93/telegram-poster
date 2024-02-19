Постим в тг через бота канал. 

1. Создаём бота через https://t.me/BotFather. Вставляем API KEY в index.js
2. Создаём канал. Добавляем бота в канал. Через https://t.me/username_to_id_bot получаем ID канала, вставляем в index.js
3. Запускаем локально через node index.js
3. Бот не умеет в видео
4. Будут вопросы, пиши)



function processInterval(interval, point, sign, property) {
  const result = [];
  const conditions = {
    "<": (i) => (property === "included" ? i <= point : i < point),
    ">": (i) => (property === "included" ? i >= point : i > point),
  };

  for (let i = interval[0]; i <= interval[1]; i++) {
    if (conditions[sign](i)) {
      result.push(i);
    }
  }

  return result;
}

console.log(processInterval([-1, 4], 1, ">", "excluded"));
