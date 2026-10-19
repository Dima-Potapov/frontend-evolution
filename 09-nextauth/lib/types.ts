// Тип поста «для экрана»: то, что реально нужно карточке.
// В v08 хватало сгенерированного типа Post. В v09 к посту добавились
// данные из СВЯЗАННЫХ таблиц (автор, лайки), поэтому собираем свой тип.
// Сериализуемые поля (строки/числа/булевы) — их безопасно передать
// из Server Component в Client Component.
export interface PostView {
  id: number;
  title: string;
  body: string;
  createdAt: string; // ISO-строка
  author: { name: string; image: string | null };
  likeCount: number; // сколько всего лайков (COUNT по таблице Like)
  likedByMe: boolean; // лайкнул ли текущий пользователь
  isMine: boolean; // автор ли текущий пользователь (показывать ли 🗑)
}
