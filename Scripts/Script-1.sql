create table if not exists products (
id serial primary key,
name varchar(255) not null,
price float not null

);

create table department (
id serial primary key,
name varchar(255) unique not null
);

select * from products;

drop table products;

--select * from students order by age ;
--
--insert into students(name, age) values ('karalyn', 28);
--
--
--update students 
--	set age = 31,
--	name = 'old Man'
--	where age > 28;
--	
--alter table students update column if not exists favoriteDog varchar(255);
--
--update students 
--set favoriteDog = 'gillian'
--where 1 = 1;
--
--delete from students where favoriteDog = 'gillian';