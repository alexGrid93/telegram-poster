import { Telegraf, Markup } from "telegraf";
import mediaGroup from "telegraf-media-group";

const BOT_API = "6148494384:AAHOCFvHsK3PrJKtuvwLJjHGompVy6v2AHw";
const CHAT_ID = "-1001934754785";

const bot = new Telegraf(BOT_API);

bot.start((ctx) => {
  ctx.reply(
    "Привет! Это бот, который публикует обхявление в канал. Фотки можно добавить в любой момент. "
  );
});

bot.use(mediaGroup());

// Функция для вывода инфы. При добавлении новых полей нужно поправить. Ну и вообще на свой вкус можно править.
const generateDescription = ({ name, price, url }) => {
  let result = `
  Название: ${name || ""}
Цена: ${price || ""}
Ссылка на маркетплейс: ${url || ""}
  `;
  return result;
};

// Объект, в который записываем пользовательский ввод
let caption = {
  name: null,
  price: null,
  url: null,
};

// Костыль для того, чтобы записывать пользовательский ввод в нужное поле объекта caption
let currentField = "";

// Сюда записываем данные о фотках
let photos = null;

bot.command("new", (ctx) => {
  // Обнуляем поля
  caption = {
    name: null,
    price: null,
    url: null,
  };
  currentField = "";
  photos = null;

  // Выводим клавиатуру
  ctx.reply(
    "_",
    Markup.keyboard([
      ["Ввести название", "Ввести цену"],
      ["Ввести ссылку", "🔎 Предпросмотр"],
      ["🏒 Херануть в канал!"],
    ]).resize()
  );
});

// Тут переключаем поля
bot.hears("Ввести название", () => {
  currentField = "name";
});

bot.hears("Ввести цену", () => {
  currentField = "price";
});

bot.hears("Ввести ссылку", () => {
  currentField = "url";
});

bot.hears("🔎 Предпросмотр", (ctx) => {
  const description = generateDescription(caption);
  console.log(photos);
  if (!photos) {
    ctx.reply(description);
  } else if (Array.isArray(photos)) {
    photos[0].caption = description;
    ctx.replyWithMediaGroup(photos);
  } else {
    ctx.replyWithPhoto(photos, { caption: description });
  }
});

bot.hears("🏒 Херануть в канал!", async (ctx) => {
  const description = generateDescription(caption);
  if (!photos) {
    await ctx.telegram.sendMessage(CHAT_ID, description);
  } else if (Array.isArray(photos)) {
    photos[0].caption = description;
    // Отправляем альбом фотографий в канал
    await ctx.telegram.sendMediaGroup(CHAT_ID, photos);
  } else {
    await ctx.telegram.sendPhoto(CHAT_ID, photos, {
      caption: description,
    });
  }
});

// Тут записываем в поля в зависимости от значения переключателя
bot.on("text", (ctx) => {
  if (currentField) {
    caption[currentField] = ctx.message.text;
    console.log(caption[currentField]);
  }
});

bot.on("media_group", async (ctx) => {
  photos = ctx.mediaGroup.map((p) => {
    return { type: "photo", media: p.photo[0].file_id };
  });
});

bot.on("photo", async (ctx) => {
  photos = ctx.update.message.photo[0].file_id;
});

bot.launch();