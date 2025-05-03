"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

// Type definitions
type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  followerCount: number;
  joinedDate: string;
};

type Community = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  members: User[];
  memberCount: number;
};

type Post = {
  id: string;
  userId: string;
  communityId: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
};

type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
};

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  communityId: string;
  attendees: {
    user: User;
    response: "going" | "maybe" | "notGoing" | null;
  }[];
};

type Notification = {
  id: string;
  type: "like" | "comment" | "follow" | "event" | "post";
  content: string;
  createdAt: string;
  isRead: boolean;
  userId: string;
  postId?: string;
  eventId?: string;
  communityId?: string;
};

// Mock data
const mockCurrentUser: User = {
  id: "c3922f28-76fd-4853-a864-9d51572ed177",
  username: "sbroster0",
  isOnline: true,
  name: "Sam Broster",
  avatar: "https://robohash.org/impeditquaerecusandae.png?size=50x50&set=set1",
  bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
  followerCount: 80,
  joinedDate: "21/06/2022",
};
const mockUsers: User[] = [
  {
    id: "c3922f28-76fd-4853-a864-9d51572ed177",
    username: "sbroster0",
    isOnline: true,
    name: "Sam Broster",
    avatar:
      "https://robohash.org/impeditquaerecusandae.png?size=50x50&set=set1",
    bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
    followerCount: 80,
    joinedDate: "21/06/2022",
  },
  {
    id: "e0d130b3-a6c6-4dd9-9bdc-eaf4169d9f43",
    username: "hhuckfield1",
    isOnline: true,
    name: "Hernando Huckfield",
    avatar: "https://robohash.org/cumnisiquas.png?size=50x50&set=set1",
    bio: "Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
    followerCount: 50,
    joinedDate: "05/05/2023",
  },
  {
    id: "c7e4f3fa-faa5-4ff0-bcc7-8a107ec1a7cd",
    username: "gswash2",
    isOnline: false,
    name: "Gaultiero Swash",
    avatar: "https://robohash.org/nullarepellendusaut.png?size=50x50&set=set1",
    bio: "Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.",
    followerCount: 96,
    joinedDate: "12/06/2023",
  },
  {
    id: "a8ee327d-deb8-429e-b8ea-aafe11f21170",
    username: "tduddin3",
    isOnline: false,
    name: "Tracy Duddin",
    avatar: "https://robohash.org/nequeistemollitia.png?size=50x50&set=set1",
    bio: "Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.\n\nInteger ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.\n\nNam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.",
    followerCount: 100,
    joinedDate: "12/09/2022",
  },
  {
    id: "b79c26b9-6453-4a5b-90d1-f92df69b8e2a",
    username: "dgrzeskowski4",
    isOnline: true,
    name: "Danni Grzeskowski",
    avatar: "https://robohash.org/autemnisiet.png?size=50x50&set=set1",
    bio: "Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.\n\nSed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.\n\nPellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus.",
    followerCount: 34,
    joinedDate: "26/08/2023",
  },
  {
    id: "ec8645ce-9467-469e-a3d6-efd342455154",
    username: "cyakuntzov5",
    isOnline: true,
    name: "Caro Yakuntzov",
    avatar: "https://robohash.org/quiatquesint.png?size=50x50&set=set1",
    bio: "Sed ante. Vivamus tortor. Duis mattis egestas metus.\n\nAenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.",
    followerCount: 34,
    joinedDate: "30/08/2023",
  },
  {
    id: "4be26248-7f61-4b15-9bda-eeb103c24cbf",
    username: "gborrott6",
    isOnline: true,
    name: "Gilli Borrott",
    avatar:
      "https://robohash.org/doloresvelitrecusandae.png?size=50x50&set=set1",
    bio: "Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.\n\nIn sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.\n\nSuspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.",
    followerCount: 23,
    joinedDate: "06/11/2023",
  },
  {
    id: "023a26c1-ce36-4931-aedc-f251bbb72c7f",
    username: "abillingsly7",
    isOnline: false,
    name: "Annetta Billingsly",
    avatar: "https://robohash.org/sintettotam.png?size=50x50&set=set1",
    bio: "Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.\n\nSed ante. Vivamus tortor. Duis mattis egestas metus.\n\nAenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.",
    followerCount: 48,
    joinedDate: "14/10/2022",
  },
  {
    id: "bde2bd24-6e45-407e-961c-f204de3bf011",
    username: "agetcliffe8",
    isOnline: false,
    name: "Abbye Getcliffe",
    avatar:
      "https://robohash.org/hicpraesentiumsuscipit.png?size=50x50&set=set1",
    bio: "Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.\n\nDuis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.\n\nMauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.",
    followerCount: 81,
    joinedDate: "28/12/2023",
  },
  {
    id: "1772099b-e403-4b28-9cf6-e9c405ca2476",
    username: "smacadam9",
    isOnline: true,
    name: "Sandy MacAdam",
    avatar: "https://robohash.org/nonomnisquod.png?size=50x50&set=set1",
    bio: "Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.",
    followerCount: 59,
    joinedDate: "08/09/2022",
  },
  {
    id: "67d2686c-f5fc-4231-90ea-f4ab32dec3a3",
    username: "tfersona",
    isOnline: true,
    name: "Tamarra Ferson",
    avatar:
      "https://robohash.org/possimusdignissimossimilique.png?size=50x50&set=set1",
    bio: "Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.\n\nIn quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet.",
    followerCount: 68,
    joinedDate: "16/09/2023",
  },
  {
    id: "e57c5d92-6736-4300-9be7-facff236ac0f",
    username: "lcammockeb",
    isOnline: true,
    name: "Letizia Cammocke",
    avatar:
      "https://robohash.org/necessitatibusquianon.png?size=50x50&set=set1",
    bio: "Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.\n\nPellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus.",
    followerCount: 62,
    joinedDate: "10/08/2023",
  },
  {
    id: "43771c22-d9b6-422d-abfd-aed53aad171d",
    username: "pstricklerc",
    isOnline: true,
    name: "Priscella Strickler",
    avatar: "https://robohash.org/namplaceatsed.png?size=50x50&set=set1",
    bio: "Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo. In blandit ultrices enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.\n\nProin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.\n\nAenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.",
    followerCount: 90,
    joinedDate: "16/07/2023",
  },
  {
    id: "110acf9e-534d-46e7-bd32-87eccfd94af1",
    username: "pingilsond",
    isOnline: false,
    name: "Pansie Ingilson",
    avatar: "https://robohash.org/estfugitab.png?size=50x50&set=set1",
    bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
    followerCount: 9,
    joinedDate: "15/01/2025",
  },
  {
    id: "a34efb3e-26b6-40cc-8b29-e064a2d45f93",
    username: "rbudde",
    isOnline: true,
    name: "Ronny Budd",
    avatar: "https://robohash.org/maiorestemporeaut.png?size=50x50&set=set1",
    bio: "In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.",
    followerCount: 72,
    joinedDate: "18/04/2024",
  },
  {
    id: "faa15221-4e87-407c-a695-5235358b4409",
    username: "ebarchrameevf",
    isOnline: true,
    name: "Elspeth Barchrameev",
    avatar: "https://robohash.org/quovelitvoluptatem.png?size=50x50&set=set1",
    bio: "Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.\n\nSed ante. Vivamus tortor. Duis mattis egestas metus.",
    followerCount: 83,
    joinedDate: "02/05/2024",
  },
  {
    id: "097c8867-03b7-46f7-9720-6ba9df019dab",
    username: "cdanzeyg",
    isOnline: false,
    name: "Carmita Danzey",
    avatar:
      "https://robohash.org/rerumvoluptasdeleniti.png?size=50x50&set=set1",
    bio: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin risus. Praesent lectus.\n\nVestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.",
    followerCount: 75,
    joinedDate: "09/06/2022",
  },
  {
    id: "d4dc3b3a-d936-4122-bd3d-cf02817ef845",
    username: "scomfordh",
    isOnline: false,
    name: "Shani Comford",
    avatar: "https://robohash.org/explicabobeataenon.png?size=50x50&set=set1",
    bio: "Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.",
    followerCount: 58,
    joinedDate: "21/01/2025",
  },
  {
    id: "7c2f26ac-f858-4fd4-95c6-6b1c958f37d6",
    username: "svalentettii",
    isOnline: true,
    name: "Sal Valentetti",
    avatar: "https://robohash.org/sapienteutamet.png?size=50x50&set=set1",
    bio: "Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.\n\nQuisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.\n\nVestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat.",
    followerCount: 60,
    joinedDate: "05/03/2025",
  },
  {
    id: "ed804e56-c998-48e9-bd14-418632d40bba",
    username: "jgooddiej",
    isOnline: true,
    name: "Jobyna Gooddie",
    avatar:
      "https://robohash.org/commodirecusandaevoluptatem.png?size=50x50&set=set1",
    bio: "Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum.\n\nIn hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.",
    followerCount: 48,
    joinedDate: "17/07/2024",
  },
  {
    id: "07e97daa-b00e-4763-aa7f-09ac68d0ea0c",
    username: "dbensteadk",
    isOnline: true,
    name: "Del Benstead",
    avatar: "https://robohash.org/hicnemoharum.png?size=50x50&set=set1",
    bio: "Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.\n\nNam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.\n\nCurabitur at ipsum ac tellus semper interdum. Mauris ullamcorper purus sit amet nulla. Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
    followerCount: 69,
    joinedDate: "06/06/2024",
  },
  {
    id: "e88ca0aa-3232-4651-a797-53324278841c",
    username: "dhamell",
    isOnline: true,
    name: "Dallas Hamel",
    avatar: "https://robohash.org/blanditiisautat.png?size=50x50&set=set1",
    bio: "Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.\n\nCras mi pede, malesuada in, imperdiet et, commodo vulputate, justo. In blandit ultrices enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
    followerCount: 18,
    joinedDate: "07/08/2024",
  },
  {
    id: "7c9f47b8-0ac5-4c32-9b66-4efdab0f7e45",
    username: "jborerm",
    isOnline: false,
    name: "Justine Borer",
    avatar: "https://robohash.org/cumsuntaliquam.png?size=50x50&set=set1",
    bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
    followerCount: 94,
    joinedDate: "13/09/2023",
  },
  {
    id: "667e196c-7285-4613-acb5-cef8bd29735d",
    username: "ipeasen",
    isOnline: false,
    name: "Ilise Pease",
    avatar: "https://robohash.org/sintporromagni.png?size=50x50&set=set1",
    bio: "Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.\n\nPraesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.",
    followerCount: 29,
    joinedDate: "06/12/2023",
  },
  {
    id: "b25304e0-69bc-4772-99a2-3efd2cf6b891",
    username: "scaughteo",
    isOnline: false,
    name: "Sky Caughte",
    avatar: "https://robohash.org/enimeumet.png?size=50x50&set=set1",
    bio: "Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.",
    followerCount: 71,
    joinedDate: "25/09/2023",
  },
  {
    id: "0ba921d9-45bc-4cd4-ad72-e15f86775ea6",
    username: "fvanaccip",
    isOnline: true,
    name: "Fredric Vanacci",
    avatar:
      "https://robohash.org/quosvoluptatibusdolore.png?size=50x50&set=set1",
    bio: "Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\n\nPhasellus in felis. Donec semper sapien a libero. Nam dui.\n\nProin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.",
    followerCount: 12,
    joinedDate: "26/10/2022",
  },
  {
    id: "3ddf7d45-ac34-4023-b5f1-e6c2f79baab6",
    username: "oidelq",
    isOnline: false,
    name: "Ofilia Idel",
    avatar:
      "https://robohash.org/occaecatinammolestiae.png?size=50x50&set=set1",
    bio: "Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo. In blandit ultrices enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
    followerCount: 8,
    joinedDate: "01/04/2023",
  },
  {
    id: "d7cd06ef-7389-48e9-b14e-0d7e2c51bf7a",
    username: "lblaineyr",
    isOnline: true,
    name: "Lillis Blainey",
    avatar:
      "https://robohash.org/perspiciatisnihiloccaecati.png?size=50x50&set=set1",
    bio: "Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris.",
    followerCount: 37,
    joinedDate: "04/10/2023",
  },
  {
    id: "c0a61be8-da75-4638-ae96-8a6ea5f52ab4",
    username: "mwinwards",
    isOnline: false,
    name: "Mannie Winward",
    avatar:
      "https://robohash.org/accusantiumisteexpedita.png?size=50x50&set=set1",
    bio: "Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.\n\nCurabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.\n\nInteger tincidunt ante vel ipsum. Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat.",
    followerCount: 92,
    joinedDate: "03/11/2024",
  },
  {
    id: "a8e7d76e-2a20-4b3c-91e9-eeeecfd094f1",
    username: "kcammiemilet",
    isOnline: true,
    name: "Katina Cammiemile",
    avatar: "https://robohash.org/animivoluptatumvel.png?size=50x50&set=set1",
    bio: "Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.\n\nFusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.",
    followerCount: 68,
    joinedDate: "27/03/2022",
  },
  {
    id: "f5fb0709-f85e-4355-ab91-7f99739f09dd",
    username: "ttunstallu",
    isOnline: false,
    name: "Trixy Tunstall",
    avatar: "https://robohash.org/delenitietbeatae.png?size=50x50&set=set1",
    bio: "Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.\n\nPraesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.",
    followerCount: 11,
    joinedDate: "03/12/2023",
  },
  {
    id: "6efc1705-5e91-4b60-b1b7-c076c93d2d8a",
    username: "dedmedv",
    isOnline: true,
    name: "Dru Edmed",
    avatar: "https://robohash.org/utplaceatlaboriosam.png?size=50x50&set=set1",
    bio: "Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.\n\nInteger ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.\n\nNam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.",
    followerCount: 14,
    joinedDate: "16/04/2023",
  },
  {
    id: "701cc9de-f09d-4df8-a3a6-bc8f21f4ec93",
    username: "ehedanw",
    isOnline: false,
    name: "Eada Hedan",
    avatar: "https://robohash.org/etveliteaque.png?size=50x50&set=set1",
    bio: "Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.\n\nQuisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
    followerCount: 32,
    joinedDate: "04/04/2024",
  },
  {
    id: "2b3bd337-9b78-48b5-ad35-14b21f69dd0b",
    username: "gdeglix",
    isOnline: true,
    name: "Gabi Degli Abbati",
    avatar:
      "https://robohash.org/blanditiisvoluptatedoloremque.png?size=50x50&set=set1",
    bio: "Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.",
    followerCount: 35,
    joinedDate: "18/10/2022",
  },
  {
    id: "bad15057-89ac-42b8-9971-aca4b1979190",
    username: "svyey",
    isOnline: false,
    name: "Samuel Vye",
    avatar: "https://robohash.org/quidemautdolor.png?size=50x50&set=set1",
    bio: "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.\n\nEtiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.",
    followerCount: 7,
    joinedDate: "20/11/2022",
  },
  {
    id: "9ff8a0be-7f07-4e0e-a2d8-8b3cfd037126",
    username: "rlongmatez",
    isOnline: false,
    name: "Rufe Longmate",
    avatar: "https://robohash.org/facereutest.png?size=50x50&set=set1",
    bio: "Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.\n\nIn quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet.",
    followerCount: 29,
    joinedDate: "01/01/2025",
  },
  {
    id: "d21daaf8-8814-4dd2-b46f-baf2c7433527",
    username: "dschruur10",
    isOnline: true,
    name: "Dulsea Schruur",
    avatar: "https://robohash.org/quisoditest.png?size=50x50&set=set1",
    bio: "Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem.",
    followerCount: 17,
    joinedDate: "08/01/2024",
  },
  {
    id: "b61df909-ddc2-46d6-a744-6426d5d71808",
    username: "wbrockbank11",
    isOnline: true,
    name: "Warden Brockbank",
    avatar: "https://robohash.org/omnisteneturnulla.png?size=50x50&set=set1",
    bio: "Phasellus in felis. Donec semper sapien a libero. Nam dui.\n\nProin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.",
    followerCount: 56,
    joinedDate: "01/10/2024",
  },
  {
    id: "613f9bc4-f97f-44a3-923c-c6f1df550cb9",
    username: "emartinyuk12",
    isOnline: true,
    name: "Eryn Martinyuk",
    avatar: "https://robohash.org/vellaboreenim.png?size=50x50&set=set1",
    bio: "In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.\n\nSuspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.\n\nMaecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.",
    followerCount: 68,
    joinedDate: "19/01/2024",
  },
  {
    id: "5da6d079-29aa-4662-8cf2-a6970ab0ed6e",
    username: "kquaif13",
    isOnline: false,
    name: "Kristin Quaif",
    avatar: "https://robohash.org/doloreutet.png?size=50x50&set=set1",
    bio: "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.",
    followerCount: 25,
    joinedDate: "30/05/2024",
  },
  {
    id: "219e3078-8c38-4761-b1a2-9fd1e84ecf67",
    username: "sjerson14",
    isOnline: false,
    name: "Stephana Jerson",
    avatar: "https://robohash.org/quieligendiet.png?size=50x50&set=set1",
    bio: "Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.\n\nQuisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.",
    followerCount: 37,
    joinedDate: "26/09/2023",
  },
  {
    id: "46c4410d-b50d-466c-b00c-afd8bbdc299d",
    username: "bsooley15",
    isOnline: true,
    name: "Bearnard Sooley",
    avatar: "https://robohash.org/utquiaminima.png?size=50x50&set=set1",
    bio: "Sed ante. Vivamus tortor. Duis mattis egestas metus.\n\nAenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.\n\nQuisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
    followerCount: 80,
    joinedDate: "20/09/2024",
  },
  {
    id: "64daaf71-91e2-43d5-8f38-49073ff2e2ca",
    username: "agogay16",
    isOnline: false,
    name: "Archibold Gogay",
    avatar: "https://robohash.org/cumeteveniet.png?size=50x50&set=set1",
    bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.",
    followerCount: 87,
    joinedDate: "11/10/2024",
  },
  {
    id: "4f78070a-15bb-45ad-8bdb-7817a53fd640",
    username: "tmenlow17",
    isOnline: false,
    name: "Tore Menlow",
    avatar:
      "https://robohash.org/doloremeaquenecessitatibus.png?size=50x50&set=set1",
    bio: "In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.\n\nAliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.",
    followerCount: 52,
    joinedDate: "04/06/2024",
  },
  {
    id: "771207dc-fe43-48f0-ba46-b7b3f8e74c46",
    username: "kjagson18",
    isOnline: false,
    name: "Kelsey Jagson",
    avatar: "https://robohash.org/repellatnostrumquis.png?size=50x50&set=set1",
    bio: "Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.\n\nSed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.\n\nPellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus.",
    followerCount: 80,
    joinedDate: "26/06/2024",
  },
  {
    id: "6cda6bbc-8d51-49dc-9acd-4849447e8c26",
    username: "mtidcomb19",
    isOnline: true,
    name: "Max Tidcomb",
    avatar: "https://robohash.org/corruptiquasisequi.png?size=50x50&set=set1",
    bio: "Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.",
    followerCount: 49,
    joinedDate: "08/05/2023",
  },
  {
    id: "a49f2fe5-20b8-498a-9df2-9ad8dd9e5219",
    username: "epierri1a",
    isOnline: false,
    name: "Emilio Pierri",
    avatar: "https://robohash.org/esseautearum.png?size=50x50&set=set1",
    bio: "Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.\n\nDuis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.\n\nMauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.",
    followerCount: 6,
    joinedDate: "18/11/2023",
  },
  {
    id: "aa2afcbb-7e1c-4a31-9529-d689f7023cf6",
    username: "nschermick1b",
    isOnline: true,
    name: "Neila Schermick",
    avatar:
      "https://robohash.org/quisquammaiorescorrupti.png?size=50x50&set=set1",
    bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.",
    followerCount: 88,
    joinedDate: "11/07/2022",
  },
  {
    id: "70fa77d7-c1d4-4fab-96d9-1ac78c3c855b",
    username: "tworpole1c",
    isOnline: false,
    name: "Tomlin Worpole",
    avatar: "https://robohash.org/etistenumquam.png?size=50x50&set=set1",
    bio: "Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.\n\nIn sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.\n\nSuspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.",
    followerCount: 21,
    joinedDate: "24/01/2022",
  },
  {
    id: "de8ea7a8-563d-4108-a36a-40f2fd3a974b",
    username: "gkirkhouse1d",
    isOnline: true,
    name: "Glendon Kirkhouse",
    avatar: "https://robohash.org/teneturquiut.png?size=50x50&set=set1",
    bio: "Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.\n\nIn quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet.\n\nMaecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.",
    followerCount: 26,
    joinedDate: "27/01/2025",
  },
];

const mockCommunities: Community[] = [
  {
    id: "comm-1",
    name: "UX Designers",
    description: "A community for UX designers to share ideas and get feedback",
    icon: "🎨",
    color: "bg-purple-500",
    members: [
      {
        id: "c3922f28-76fd-4853-a864-9d51572ed177",
        username: "sbroster0",
        isOnline: true,
        name: "Sam Broster",
        avatar:
          "https://robohash.org/impeditquaerecusandae.png?size=50x50&set=set1",
        bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
        followerCount: 80,
        joinedDate: "21/06/2022",
      },
    ],
    memberCount: 1,
  },
  {
    id: "comm-2",
    name: "Web Developers",
    description: "For developers interested in web technologies",
    icon: "💻",
    color: "bg-blue-500",
    members: [
      {
        id: "c3922f28-76fd-4853-a864-9d51572ed177",
        username: "sbroster0",
        isOnline: true,
        name: "Sam Broster",
        avatar:
          "https://robohash.org/impeditquaerecusandae.png?size=50x50&set=set1",
        bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
        followerCount: 80,
        joinedDate: "21/06/2022",
      },
    ],
    memberCount: 1,
  },
  {
    id: "comm-3",
    name: "Product Managers",
    description: "Connecting product managers worldwide",
    icon: "📊",
    color: "bg-teal-500",
    members: [],
    memberCount: 0,
  },
  {
    id: "comm-4",
    name: "Digital Marketing",
    description: "Learn and share digital marketing strategies",
    icon: "📱",
    color: "bg-orange-500",
    members: [],
    memberCount: 0,
  },
  {
    id: "comm-5",
    name: "Startup Founders",
    description: "Network with other startup founders",
    icon: "🚀",
    color: "bg-green-500",
    members: [
      {
        id: "c3922f28-76fd-4853-a864-9d51572ed177",
        username: "sbroster0",
        isOnline: true,
        name: "Sam Broster",
        avatar:
          "https://robohash.org/impeditquaerecusandae.png?size=50x50&set=set1",
        bio: "In congue. Etiam justo. Etiam pretium iaculis justo.\n\nIn hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.\n\nNulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.",
        followerCount: 80,
        joinedDate: "21/06/2022",
      },
    ],
    memberCount: 1,
  },
  {
    id: "comm-6",
    name: "AI & Machine Learning",
    description: "Dive into machine learning models and AI discussions",
    icon: "🤖",
    color: "bg-indigo-500",
    members: [],
    memberCount: 0,
  },
  {
    id: "comm-7",
    name: "Backend Builders",
    description: "Explore API design, databases, and server architectures",
    icon: "🛠️",
    color: "bg-gray-600",
    members: [],
    memberCount: 0,
  },
  {
    id: "comm-8",
    name: "Open Source Heroes",
    description: "Collaborate and contribute to open source projects",
    icon: "🌍",
    color: "bg-yellow-500",
    members: [],
    memberCount: 0,
  },
  {
    id: "comm-9",
    name: "Design Systems Guild",
    description: "Create and maintain scalable design systems",
    icon: "🧩",
    color: "bg-pink-500",
    members: [],
    memberCount: 0,
  },
  {
    id: "comm-10",
    name: "Cloud Enthusiasts",
    description: "All about AWS, GCP, Azure, and cloud infrastructure",
    icon: "☁️",
    color: "bg-cyan-500",
    members: [],
    memberCount: 0,
  },
];
const mockPosts: Post[] = [
  // Posts for "UX Designers" (comm-1)
  {
    id: "post-1",
    userId: "",
    communityId: "comm-1",
    content:
      "How do you approach creating personas for your projects? Any tools or templates you recommend? 🤔",
    createdAt: "2025-04-25T10:30:00Z",
    likes: 14,
    isLiked: false,
    comments: [
      {
        id: "comment-1",
        userId: "",
        content:
          "I use Xtensio to build personas. It’s a simple tool with lots of templates.",
        createdAt: "2025-04-27T11:00:00Z",
        likes: 5,
        isLiked: false,
      },
      {
        id: "comment-2",
        userId: "",
        content:
          "I’ve been using Figma for creating personas. It’s flexible and works well for collaboration!",
        createdAt: "2025-04-29T12:00:00Z",
        likes: 7,
        isLiked: false,
      },
    ],
  },

  // Post 2
  {
    id: "post-2",
    userId: "",
    communityId: "comm-1",
    content:
      "What are some common UX mistakes you see beginners making when designing mobile apps? 📱",
    createdAt: "2025-05-01T12:15:00Z",
    likes: 18,
    isLiked: false,
    comments: [
      {
        id: "comment-3",
        userId: "",
        content:
          "One mistake I see is not optimizing for touch targets. It’s crucial for a smooth user experience!",
        createdAt: "2025-05-02T13:00:00Z",
        likes: 8,
        isLiked: false,
      },
      {
        id: "comment-4",
        userId: "",
        content:
          "Another big issue is neglecting accessibility features like screen reader support.",
        createdAt: "2025-05-02T14:00:00Z",
        likes: 5,
        isLiked: false,
      },
    ],
  },

  // Post 3
  {
    id: "post-3",
    userId: "",
    communityId: "comm-1",
    content:
      "Can anyone recommend some great resources to learn about UI design trends in 2025? I’m looking to stay up-to-date. 🎨",
    createdAt: "2025-04-03T14:30:00Z",
    likes: 22,
    isLiked: false,
    comments: [
      {
        id: "comment-5",
        userId: "",
        content:
          "I’ve been following Smashing Magazine for up-to-date articles on design trends. Highly recommend it!",
        createdAt: "2025-04-15T15:00:00Z",
        likes: 10,
        isLiked: false,
      },
      {
        id: "comment-6",
        userId: "",
        content:
          "Check out Awwwards. They showcase the best UI designs and the latest trends from top designers.",
        createdAt: "2025-04-23T15:30:00Z",
        likes: 12,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-4",
    userId: "",
    communityId: "comm-2",
    content:
      "What are your favorite tools for front-end development in 2025? I’m looking to explore something new! 🚀",
    createdAt: "2025-04-01T10:30:00Z",
    likes: 23,
    isLiked: false,
    comments: [
      {
        id: "comment-7",
        userId: "",
        content:
          "I’m really enjoying using Tailwind CSS these days! It’s fast and easy to customize.",
        createdAt: "2025-04-12T11:00:00Z",
        likes: 12,
        isLiked: false,
      },
      {
        id: "comment-8",
        userId: "",
        content:
          "For front-end frameworks, React is still my go-to. But I’m also experimenting with Svelte!",
        createdAt: "2025-04-17T12:00:00Z",
        likes: 8,
        isLiked: false,
      },
    ],
  },

  // Post 2
  {
    id: "post-5",
    userId: "",
    communityId: "comm-2",
    content:
      "What’s the best way to handle form validation in JavaScript? I’ve been using vanilla JS, but open to suggestions! ✨",
    createdAt: "2025-04-02T12:15:00Z",
    likes: 18,
    isLiked: false,
    comments: [
      {
        id: "comment-9",
        userId: "",
        content:
          "I usually use libraries like Formik for React. It handles a lot of validation scenarios well!",
        createdAt: "2025-04-03T13:00:00Z",
        likes: 9,
        isLiked: false,
      },
      {
        id: "comment-10",
        userId: "",
        content:
          "Check out the validator.js library if you need a lightweight and feature-rich solution.",
        createdAt: "2025-05-02T14:00:00Z",
        likes: 5,
        isLiked: false,
      },
    ],
  },

  // Post 3
  {
    id: "post-6",
    userId: "",
    communityId: "comm-2",
    content:
      "Any recommendations for learning full-stack development in 2025? Trying to build my skills beyond front-end! 🌐",
    createdAt: "2025-05-01T14:30:00Z",
    likes: 28,
    isLiked: false,
    comments: [
      {
        id: "comment-11",
        userId: "",
        content:
          "The Odin Project is a great free resource for learning full-stack. They have a structured curriculum!",
        createdAt: "2025-05-01T15:00:00Z",
        likes: 15,
        isLiked: false,
      },
      {
        id: "comment-12",
        userId: "",
        content:
          "I suggest you dive into Node.js and Express for the back-end. There are plenty of tutorials on YouTube and freeCodeCamp.",
        createdAt: "2025-05-02T15:30:00Z",
        likes: 12,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-7",
    userId: "",
    communityId: "comm-3",
    content:
      "How do you prioritize features when building a product roadmap? Any tips for balancing user needs with business goals? 🔑",
    createdAt: "2025-05-02T16:00:00Z",
    likes: 15,
    isLiked: false,
    comments: [
      {
        id: "comment-13",
        userId: "",
        content:
          "We use the MoSCoW method for prioritizing. It’s simple but effective in distinguishing between Must-have, Should-have, Could-have, and Won't-have features.",
        createdAt: "2025-05-02T16:30:00Z",
        likes: 7,
        isLiked: false,
      },
      {
        id: "comment-14",
        userId: "",
        content:
          "I also like the RICE scoring model for feature prioritization. It helps in quantifying impact, confidence, and effort.",
        createdAt: "2025-05-02T17:00:00Z",
        likes: 5,
        isLiked: false,
      },
    ],
  },

  // Post 8
  {
    id: "post-8",
    userId: "",
    communityId: "comm-3",
    content:
      "What tools do you recommend for managing product feedback from users? We need a system to collect and analyze user feedback efficiently. 📝",
    createdAt: "2025-05-01T17:30:00Z",
    likes: 18,
    isLiked: false,
    comments: [
      {
        id: "comment-15",
        userId: "",
        content:
          "I use Productboard. It’s great for gathering, organizing, and prioritizing feedback from various sources.",
        createdAt: "2025-05-01T18:00:00Z",
        likes: 10,
        isLiked: false,
      },
      {
        id: "comment-16",
        userId: "",
        content:
          "We’ve been using UserVoice for collecting feedback, and it integrates well with our Jira and Trello boards.",
        createdAt: "2025-05-02T18:30:00Z",
        likes: 6,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-9",
    userId: "",
    communityId: "comm-4",
    content:
      "What are some effective strategies for increasing organic reach on social media? I’ve been experimenting with SEO, but would love to hear more ideas! 📈",
    createdAt: "2025-04-14T18:45:00Z",
    likes: 25,
    isLiked: false,
    comments: [
      {
        id: "comment-17",
        userId: "",
        content:
          "Consistency is key! Also, engaging with your followers through comments and direct messages can help boost organic reach.",
        createdAt: "2025-05-02T19:00:00Z",
        likes: 12,
        isLiked: false,
      },
      {
        id: "comment-18",
        userId: "",
        content:
          "I’d recommend using UTM parameters for tracking your links. It gives you better insights on your audience’s behavior.",
        createdAt: "2025-05-02T19:30:00Z",
        likes: 7,
        isLiked: false,
      },
    ],
  },

  // Post 10
  {
    id: "post-10",
    userId: "",
    communityId: "comm-4",
    content:
      "Has anyone here used paid ads on Instagram and Facebook? What has your experience been like? Looking for tips on maximizing ROI. 💵",
    createdAt: "2025-04-19T19:45:00Z",
    likes: 20,
    isLiked: false,
    comments: [
      {
        id: "comment-19",
        userId: "",
        content:
          "Make sure to use lookalike audiences and retargeting ads. They’ve worked wonders for me in terms of improving ROI.",
        createdAt: "2025-04-20T20:00:00Z",
        likes: 10,
        isLiked: false,
      },
      {
        id: "comment-20",
        userId: "",
        content:
          "A/B testing is a must. Start with small budgets and test different creatives before scaling up.",
        createdAt: "2025-05-02T20:30:00Z",
        likes: 8,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-11",
    userId: "",
    communityId: "comm-5",
    content:
      "As a startup founder, what’s the biggest challenge you’ve faced in scaling your business? I’m struggling with managing cash flow and hiring the right talent. 💡",
    createdAt: "2025-04-28T20:45:00Z",
    likes: 30,
    isLiked: false,
    comments: [
      {
        id: "comment-21",
        userId: "",
        content:
          "Cash flow management is definitely a big one. I recommend using forecasting tools to predict your cash flow more accurately.",
        createdAt: "2025-04-30T21:00:00Z",
        likes: 12,
        isLiked: false,
      },
      {
        id: "comment-22",
        userId: "",
        content:
          "Hiring is tough! Focus on company culture and look for people who are adaptable. Skills can be trained, but attitude is everything.",
        createdAt: "2025-05-01T21:15:00Z",
        likes: 8,
        isLiked: false,
      },
    ],
  },

  // Post 12
  {
    id: "post-12",
    userId: "",
    communityId: "comm-5",
    content:
      "Any advice on finding the right investors for a seed round? I’ve been pitching, but haven’t found the right fit yet. 🤔",
    createdAt: "2025-05-01T21:30:00Z",
    likes: 22,
    isLiked: false,
    comments: [
      {
        id: "comment-23",
        userId: "",
        content:
          "Have you considered angel investors? They can be more flexible and open to early-stage startups. I’d also suggest networking through startup events.",
        createdAt: "2025-05-01T21:45:00Z",
        likes: 15,
        isLiked: false,
      },
      {
        id: "comment-24",
        userId: "",
        content:
          "Make sure your pitch deck is clear and shows traction. Investors want to see growth, even if it's small. Good luck!",
        createdAt: "2025-05-02T22:00:00Z",
        likes: 10,
        isLiked: false,
      },
    ],
  },

  {
    id: "post-13",
    userId: "",
    communityId: "comm-6",
    content:
      "Has anyone fine-tuned an open-source LLM lately? Curious about real-world use cases and training tips. 🧠",
    createdAt: "2025-05-01T22:30:00Z",
    likes: 18,
    isLiked: false,
    comments: [
      {
        id: "comment-25",
        userId: "",
        content:
          "I used LoRA on a GPT-2 base for chatbot fine-tuning. Hugging Face makes it manageable even with a single GPU.",
        createdAt: "2025-05-01T22:40:00Z",
        likes: 9,
        isLiked: false,
      },
      {
        id: "comment-26",
        userId: "",
        content:
          "Try QLoRA for memory efficiency—it’s impressive for low-resource environments.",
        createdAt: "2025-05-02T22:45:00Z",
        likes: 7,
        isLiked: false,
      },
      {
        id: "comment-27",
        userId: "",
        content:
          "I fine-tuned for sentiment analysis in just a few hours on Colab. Worth experimenting with small datasets.",
        createdAt: "2025-05-02T22:50:00Z",
        likes: 6,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-14",
    userId: "",
    communityId: "comm-7",
    content:
      "What’s your MVP launch strategy as a solo founder? Do you test with friends or go straight to Product Hunt?",
    createdAt: "2025-05-02T23:00:00Z",
    likes: 12,
    isLiked: false,
    comments: [
      {
        id: "comment-28",
        userId: "",
        content:
          "I prefer Reddit + IndieHackers for early feedback. Product Hunt once I get some traction.",
        createdAt: "2025-05-02T23:05:00Z",
        likes: 4,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-15",
    userId: "",
    communityId: "comm-7",
    content:
      "Any advice on balancing a day job with building your side project? Burnout is creeping in.",
    createdAt: "2025-05-01T23:20:00Z",
    likes: 10,
    isLiked: false,
    comments: [
      {
        id: "comment-29",
        userId: "",
        content:
          "Try batching tasks on weekends and set 2-hr blocks on weekdays. Discipline > motivation.",
        createdAt: "2025-05-02T23:25:00Z",
        likes: 3,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-16",
    userId: "",
    communityId: "comm-8",
    content:
      "What’s your favorite open source project you contributed to and why? Always looking to get inspired!",
    createdAt: "2025-04-03T23:30:00Z",
    likes: 8,
    isLiked: false,
    comments: [
      {
        id: "comment-30",
        userId: "",
        content:
          "I loved working on Astro—it’s well-documented and super welcoming for new contributors.",
        createdAt: "2025-04-03T23:35:00Z",
        likes: 5,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-17",
    userId: "",
    communityId: "comm-8",
    content:
      "How do you find beginner-friendly issues to contribute to in large OSS repos? Feels overwhelming at first.",
    createdAt: "2025-04-13T23:40:00Z",
    likes: 9,
    isLiked: false,
    comments: [
      {
        id: "comment-31",
        userId: "",
        content:
          "Look for ‘good first issue’ labels. Also check out FirstTimersOnly and Up-for-Grabs.net.",
        createdAt: "2025-04-23T23:45:00Z",
        likes: 2,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-18",
    userId: "",
    communityId: "comm-9",
    content:
      "How do you handle versioning in your design system? Especially when multiple teams depend on it.",
    createdAt: "2025-05-01T23:50:00Z",
    likes: 15,
    isLiked: false,
    comments: [
      {
        id: "comment-32",
        userId: "",
        content:
          "We use semantic versioning and release notes via Figma plugins + GitHub tags. Helps with visibility.",
        createdAt: "2025-05-02T23:55:00Z",
        likes: 5,
        isLiked: false,
      },
      {
        id: "comment-33",
        userId: "",
        content:
          "Design Tokens + CI automation with Style Dictionary helps us maintain consistency across platforms.",
        createdAt: "2025-05-02T00:00:00Z",
        likes: 4,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-19",
    userId: "",
    communityId: "comm-9",
    content:
      "Do you document components directly in Figma or use a separate tool like Zeroheight or Notion?",
    createdAt: "2025-04-04T00:10:00Z",
    likes: 11,
    isLiked: false,
    comments: [
      {
        id: "comment-34",
        userId: "",
        content:
          "We use Zeroheight to sync with Figma. Great for dev handoff and scaling across teams.",
        createdAt: "2025-04-20T00:15:00Z",
        likes: 3,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-20",
    userId: "",
    communityId: "comm-10",
    content:
      "What’s your go-to setup for managing multi-cloud infrastructure? Trying to balance AWS + GCP for different workloads.",
    createdAt: "2025-04-04T00:20:00Z",
    likes: 17,
    isLiked: false,
    comments: [
      {
        id: "comment-35",
        userId: "",
        content:
          "We use Terraform with provider modules per cloud and a central CI/CD pipeline with GitHub Actions.",
        createdAt: "2025-04-14T00:25:00Z",
        likes: 6,
        isLiked: false,
      },
      {
        id: "comment-36",
        userId: "",
        content:
          "Consider Crossplane—it abstracts cloud providers well and works great with Kubernetes-native infra.",
        createdAt: "2025-04-24T00:30:00Z",
        likes: 4,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-21",
    userId: "",
    communityId: "comm-10",
    content:
      "Any tips on reducing cloud costs without sacrificing performance? AWS bills are getting out of hand lately.",
    createdAt: "2025-04-14T00:35:00Z",
    likes: 14,
    isLiked: false,
    comments: [
      {
        id: "comment-37",
        userId: "",
        content:
          "Start with cost explorer + right-sizing instances. Also look into spot instances for non-critical workloads.",
        createdAt: "2025-04-24T00:40:00Z",
        likes: 5,
        isLiked: false,
      },
      {
        id: "comment-38",
        userId: "",
        content:
          "CloudZero is a great tool for tracking spend per feature or team. Way more actionable than AWS alone.",
        createdAt: "2025-04-26T00:45:00Z",
        likes: 3,
        isLiked: false,
      },
    ],
  },
];

const mockEvents: Event[] = [
  {
    id: "event-1",
    title: "UX Workshop: Designing for Accessibility",
    description:
      "Learn how to create accessible designs that work for everyone. We'll cover WCAG guidelines, assistive technologies, and practical implementation strategies.",
    date: "2025-05-01",
    startTime: "13:00",
    endTime: "15:30",
    location: "Virtual (Zoom)",
    communityId: "comm-1",
    attendees: [],
  },
  {
    id: "event-2",
    title: "Web Dev Meetup: Next.js Best Practices",
    description:
      "Join us to discuss the latest Next.js features and best practices for building high-performance web applications.",
    date: "2025-05-02",
    startTime: "18:00",
    endTime: "20:00",
    location: "Tech Hub Co-working Space",
    communityId: "comm-2",
    attendees: [],
  },
  {
    id: "event-3",
    title: "Product Management Panel Discussion",
    description:
      "Industry experts share their experiences and insights on product management challenges and strategies.",
    date: "2025-04-29",
    startTime: "19:00",
    endTime: "21:00",
    location: "Innovation Center",
    communityId: "comm-3",
    attendees: [],
  },
  {
    id: "event-4",
    title: "Digital Marketing Trends 2025",
    description:
      "Discover the latest digital marketing trends and how to leverage them for your business growth strategy.",
    date: "2025-05-03",
    startTime: "14:00",
    endTime: "16:00",
    location: "Virtual (Zoom)",
    communityId: "comm-4",
    attendees: [],
  },
  {
    id: "event-5",
    title: "Startup Funding Workshop",
    description:
      "Everything you need to know about securing funding for your startup - from bootstrapping to Series A.",
    date: "2025-05-02",
    startTime: "10:00",
    endTime: "12:30",
    location: "Entrepreneur Hub",
    communityId: "comm-5",
    attendees: [],
  },
];


const One: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityHubContent />
    </Suspense>
  );
};
// Component definitions
const CommunityHubContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Global state
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);

  // UI state
  const [activeTab, setActiveTab] = useState<"feed" | "communities">("feed");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [newPost, setNewPost] = useState({
    content: "",
    image: null as File | null,
  });
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [isResponsesOpen, setIsResponsesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState({
    id: selectedUser?.id || "",
    name: selectedUser?.name || "",
    username: selectedUser?.username || "",
    bio: selectedUser?.bio || "",
    avatar: selectedUser?.avatar || "",
  });
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [date, setDate] = useState("");
const [startTime, setStartTime] = useState("");
const [endTime, setEndTime] = useState("");
const [location, setLocation] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file); // For base64 encoding
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Simulate saving the user profile (no actual API call)
      alert("Profile updated successfully");
      setIsProfileModalOpen(false);

      // Update currentUser state with the new data
      setCurrentUser((prev) => ({
        ...prev,
        name: editedUser.name,
        username: editedUser.username,
        bio: editedUser.bio,
        avatar: editedUser.avatar,
      }));

      // Update the corresponding user in the mockUsers array
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editedUser.id ? { ...user, ...editedUser } : user
        )
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const formatTime = (date: string): string => {
    const now = new Date();
    const createdDate = new Date(date); // createdAt is in UTC format

    // Ensure the date is valid
    if (isNaN(createdDate.getTime())) {
      return "Invalid date";
    }

    const timeDifference = now.getTime() - createdDate.getTime();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    } else {
      return `${seconds} sec${seconds > 1 ? "s" : ""} ago`;
    }
  };

  const getUserById = (id: string): User => {
    return users.find((user) => user.id === id) || mockCurrentUser;
  };

  const getCommunityById = (id: string): Community => {
    return (
      communities.find((community) => community.id === id) || mockCommunities[0]
    );
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node)
    ) {
      setIsNotificationsOpen(false);
    }

    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node)
    ) {
      setIsUserMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Event handlers
  const toggleLikePost = (postId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
      setIsLoading(false);
    }, 300);
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked
                      ? comment.likes - 1
                      : comment.likes + 1,
                  }
                : comment
            ),
          };
        })
      );
      setIsLoading(false);
    }, 300);
  };

  const toggleExpandComments = (postId: string) => {
    setExpandedComments((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleCommentChange = (postId: string, value: string) => {
    setNewComment((prev) => ({ ...prev, [postId]: value }));
  };

  const addComment = (postId: string) => {
    if (!newComment[postId]?.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        userId: currentUser.id,
        content: newComment[postId],
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            comments: [...post.comments, newCommentObj],
          };
        })
      );

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      setIsLoading(false);
    }, 500);
  };

  const toggleJoinCommunity = (communityId: string, currentUser: User) => {
    setIsLoading(true);
    setTimeout(() => {
      setCommunities((prevCommunities) =>
        prevCommunities.map((community) => {
          if (community.id !== communityId) return community;

          const isMember = community.members.some(
            (member) => member.id === currentUser.id
          );

          const updatedMembers = isMember
            ? community.members.filter((member) => member.id !== currentUser.id)
            : [...community.members, currentUser];

          return {
            ...community,
            members: updatedMembers,
            memberCount: updatedMembers.length,
          };
        })
      );
      setIsLoading(false);
    }, 500);
  };
  const updateEventResponse = (
    eventId: string,
    response: "going" | "maybe" | "notGoing" | null
  ) => {
    setIsLoading(true);

    setTimeout(() => {
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id !== eventId) return event;

          const updatedAttendees = event.attendees.map((attendee) => {
            if (attendee.user.id === currentUser.id) {
              return { ...attendee, response };
            }
            return attendee;
          });

          // Update the selected event immediately after the state change
          const updatedEvent = {
            ...event,
            attendees: updatedAttendees,
          };

          setSelectedEvent(updatedEvent); // Directly update selectedEvent state

          return updatedEvent; // Return the updated event
        })
      );

      setIsLoading(false);
    }, 300);
  };

  const handleNewPost = () => {
    if (!newPost.content.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const joinedCommunity = communities.find((c) =>
        c.members.some((member) => member.id === currentUser.id)
      );

      if (!joinedCommunity) {
        setIsLoading(false);
        alert("You must join a community before posting.");
        return;
      }

      const newPostObj: Post = {
        id: `post-${Date.now()}`,
        userId: currentUser.id,
        communityId: joinedCommunity.id,
        content: newPost.content,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        comments: [],
      };

      setPosts((prevPosts) => [newPostObj, ...prevPosts]);
      setNewPost({ content: "", image: null });
      setIsPostModalOpen(false);
      setIsLoading(false);
    }, 800);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };
  const filteredPosts = useMemo(() => {
    // Get all community IDs current user is part of
    const userCommunityIds = communities
      .filter((community) =>
        community.members.some((member) => member.id === currentUser.id)
      )
      .map((community) => community.id);

    // First filter: only posts from current user's communities
    const visiblePosts = posts
      .filter((post) => userCommunityIds.includes(post.communityId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (!searchQuery) return visiblePosts;

    const query = searchQuery.toLowerCase();
    return visiblePosts.filter((post) => {
      const user = getUserById(post.userId);
      const community = getCommunityById(post.communityId);

      return (
        post.content.toLowerCase().includes(query) ||
        user?.name?.toLowerCase().includes(query) ||
        community?.name?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, posts, communities, currentUser.id]);

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const openUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const openCommunitySettings = (community: Community) => {
    setSelectedCommunity(community);
    setIsCommunityOpen(true);
  };

  const distributeMembersToCommunities = () => {
    const updatedCommunities = communities.map((community) => ({
      ...community,
      members: community.members || [],
      memberCount: community.members?.length || 0,
    }));

    const updatedEvents = [...mockEvents];

    const otherUsers = users.filter((user) => user.id !== currentUser.id);

    otherUsers.forEach((user) => {
      const numCommunities = Math.floor(Math.random() * 3) + 1;
      const shuffledCommunities = [...updatedCommunities].sort(
        () => Math.random() - 0.5
      );
      const selectedCommunities = shuffledCommunities.slice(0, numCommunities);

      selectedCommunities.forEach((community) => {
        if (!community.members.find((member) => member.id === user.id)) {
          community.members.push(user);
          community.memberCount += 1;
        }
      });
    });

    // Ensure current user is also in at least one community
    const userAlreadyIn = updatedCommunities.some((community) =>
      community.members.find((member) => member.id === currentUser.id)
    );
    if (!userAlreadyIn) {
      const randomCommunity =
        updatedCommunities[
          Math.floor(Math.random() * updatedCommunities.length)
        ];
      randomCommunity.members.push(currentUser);
      randomCommunity.memberCount += 1;
    }

    const getRandomResponse = (): "going" | "maybe" | "notGoing" | null => {
      const responses = ["going", "maybe", "notGoing", null];
      return responses[Math.floor(Math.random() * responses.length)] as
        | "going"
        | "maybe"
        | "notGoing"
        | null;
    };

    updatedEvents.forEach((event) => {
      const community = updatedCommunities.find(
        (c) => c.id === event.communityId
      );
      if (community && community.members.length > 0) {
        event.attendees = community.members.map((member) => ({
          user: member,
          response: getRandomResponse(),
        }));
      }
    });

    const updatedPosts = mockPosts.map((post) => {
      const community = updatedCommunities.find(
        (c) => c.id === post.communityId
      );
      if (!community) return post;

      const eligibleMembers = community.members.filter(
        (member) => member.id !== currentUser.id
      );

      const randomMember =
        eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];

      return {
        ...post,
        userId: randomMember ? randomMember.id : post.userId, // fallback to original if no member
      };
    });
    setPosts(updatedPosts);
    setCommunities(updatedCommunities);
    setEvents(updatedEvents);
  };

  const filterCommunities = () => {
    return communities.filter(
      (community) =>
        !community.members.some((member) => member.id === currentUser.id)
    );
  };
  const isUserInCommunity = (community: Community, user: User) => {
    return community.members.some((member) => member.id === user.id);
  };

  useEffect(() => {
    const newNotifications: Notification[] = [];

    const getRandomPastDate = () => {
      const now = new Date();
      const past = new Date(now);
      past.setDate(now.getDate() - Math.floor(Math.random() * 30));
      past.setHours(Math.floor(Math.random() * 24));
      past.setMinutes(Math.floor(Math.random() * 60));
      past.setSeconds(Math.floor(Math.random() * 60));
      return past.toISOString();
    };

    const userJoinedCommunities: { communityId: string; joinedAt: string }[] =
      [];

    // Track when the user joined each community
    communities.forEach((c) => {
      const isMember = c.members.some((m) => m.id === currentUser.id);
      if (isMember) {
        const alreadyNotified = notifications.find(
          (n) =>
            n.type === "follow" &&
            n.communityId === c.id &&
            n.userId === currentUser.id
        );

        if (!alreadyNotified) {
          const joinedAt = getRandomPastDate();
          userJoinedCommunities.push({ communityId: c.id, joinedAt });

          newNotifications.push({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: "follow",
            content: `You joined the community "${c.name}"`,
            createdAt: joinedAt,
            isRead: false,
            userId: currentUser.id,
            communityId: c.id,
          });
        } else {
          userJoinedCommunities.push({
            communityId: c.id,
            joinedAt: alreadyNotified.createdAt,
          });
        }
      }
    });

    // Generate notifications for new posts created after user joined the community
    posts.forEach((post) => {
      // Skip user's own posts
      if (post.userId === currentUser.id) {
        return;
      }

      const joined = userJoinedCommunities.find(
        (j) => j.communityId === post.communityId
      );

      // Check if user is a member of the community and the post was created after they joined
      if (
        joined &&
        new Date(post.createdAt) > new Date(joined.joinedAt) &&
        !notifications.some(
          (n) => n.postId === post.id && n.userId === currentUser.id
        )
      ) {
        // Find the community to get its name
        const community = communities.find((c) => c.id === post.communityId);

        if (community) {
          newNotifications.push({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: "post",
            content: `New post in "${community.name}"`,
            createdAt: post.createdAt,
            isRead: false,
            userId: currentUser.id,
            postId: post.id,
            communityId: post.communityId,
          });
        }
      }
    });

    // Now generate event notifications, but only if the user joined *before* the event
    events.forEach((event) => {
      const joined = userJoinedCommunities.find(
        (j) => j.communityId === event.communityId
      );

      if (
        joined &&
        new Date(event.date) > new Date(joined.joinedAt) &&
        !notifications.some(
          (n) =>
            n.type === "event" &&
            n.eventId === event.id &&
            n.userId === currentUser.id
        )
      ) {
        newNotifications.push({
          id: `notif-${Date.now()}-${Math.random()}`,
          type: "event",
          content: `New event "${event.title}" in your community`,
          createdAt: event.date,
          isRead: false,
          userId: currentUser.id,
          eventId: event.id,
          communityId: event.communityId,
        });
      }
    });

    // Likes and Comments
    posts.forEach((post) => {
      if (post.userId === currentUser.id) {
        post.comments.forEach((comment) => {
          if (
            comment.userId !== currentUser.id &&
            !notifications.some(
              (n) =>
                n.type === "comment" &&
                n.postId === post.id &&
                n.userId === currentUser.id &&
                n.content.includes(comment.content)
            )
          ) {
            newNotifications.push({
              id: `notif-${Date.now()}-${Math.random()}`,
              type: "comment",
              content: `Someone commented on your post: "${comment.content}"`,
              createdAt: comment.createdAt,
              isRead: false,
              userId: currentUser.id,
              postId: post.id,
              communityId: post.communityId,
            });
          }
        });

        if (
          post.likes > 0 &&
          !notifications.some(
            (n) =>
              n.type === "like" &&
              n.postId === post.id &&
              n.userId === currentUser.id
          )
        ) {
          newNotifications.push({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: "like",
            content: `Someone liked your post`,
            createdAt: getRandomPastDate(),
            isRead: false,
            userId: currentUser.id,
            postId: post.id,
            communityId: post.communityId,
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      const allNotifications = [...notifications, ...newNotifications];

      // Sort by most recent
      allNotifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log(allNotifications);
      setNotifications(allNotifications);
    }
  }, [communities, posts, events, currentUser.id, notifications]);
  // Call the function when component mounts
  useEffect(() => {
    distributeMembersToCommunities();
  }, []);

  
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "feed" || tab === "communities") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab]);
  // Main UI Components
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Modals */}
      {/* Post Creation Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 animate-fadeInUp">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                Create Post
              </h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-gray-500 hover:text-gray cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-grow">
                  <div className="mb-3">
                    {/* Check if the user is part of any community */}
                    {communities.filter((c) =>
                      c.members.some((member) => member.id === currentUser.id)
                    ).length === 0 ? (
                      <p className="text-red-500">Join a community first</p>
                    ) : (
                      <select
                        className="w-full p-2 border rounded-md bg-gray-50 text-sm"
                        defaultValue={
                          communities.filter((c) =>
                            c.members.some(
                              (member) => member.id === currentUser.id
                            )
                          )[0].id
                        }
                      >
                        {communities
                          .filter((c) =>
                            c.members.some(
                              (member) => member.id === currentUser.id
                            )
                          )
                          .map((community) => (
                            <option key={community.id} value={community.id}>
                              {community.icon} {community.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                  <textarea
                    placeholder="What's on your mind?"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32"
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                  />
                  {newPost.image && (
                    <div className="mt-3 relative">
                      <img
                        src={URL.createObjectURL(newPost.image)}
                        alt="Post preview"
                        className="rounded-lg max-h-64 w-auto"
                      />
                      <button
                        onClick={() =>
                          setNewPost((prev) => ({ ...prev, image: null }))
                        }
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={handleNewPost}
                      disabled={!newPost.content.trim()}
                      className={`px-4 py-2 rounded-full text-white font-medium ${
                        newPost.content.trim()
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-300 cursor-not-allowed"
                      } transition duration-200 ease-in-out cursor-pointer`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
{showCreateEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Create New Event</h3>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newEvent: Event = {
            id: crypto.randomUUID(),
            title,
            description,
            date,
            startTime,
            endTime,
            location,
            communityId: selectedCommunityId,
            attendees: [
              {
                user: currentUser,
                response: "going",
              },
            ],
          };
          setEvents([...events, newEvent]);
          setShowCreateEvent(false);
        }}
      >
        {/* Community Select */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Community
          </label>
          <select
            required
            className="w-full p-2 border rounded-md bg-gray-50 text-sm"
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
          >
            {communities
              .filter((c) =>
                c.members.some((m) => m.id === currentUser.id)
              )
              .map((community) => (
                <option key={community.id} value={community.id}>
                  {community.icon} {community.name}
                </option>
              ))}
          </select>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Event Title"
          required
          className="w-full mb-3 p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          placeholder="Event Description"
          required
          className="w-full mb-3 p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Date, Time, Location */}
        <input
          type="date"
          required
          className="w-full mb-3 p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          required
          className="w-full mb-3 p-2 border rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          required
          className="w-full mb-3 p-2 border rounded"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          required
          className="w-full mb-4 p-2 border rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-gray-600"
            onClick={() => setShowCreateEvent(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Event Modal */}
      {isEventModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 animate-fadeInUp max-h-[70vh] overflow-y-auto sm:w-4/5 md:w-1/2 lg:w-1/3">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                Event Details
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-gray-500 hover:text-gray cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {selectedEvent.title}
              </h2>

              {/* Date */}
              <div className="flex items-center text-gray-600 mb-4">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {format(parseISO(selectedEvent.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center text-gray-600 mb-4">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-6">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{selectedEvent.location}</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              {/* Attendees */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Attendees</h4>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {
                        selectedEvent.attendees.filter(
                          (a) => a.response === "going"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-500">Going</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">
                      {
                        selectedEvent.attendees.filter(
                          (a) => a.response === "maybe"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-500">Maybe</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      {
                        selectedEvent.attendees.filter(
                          (a) => a.response === "notGoing"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-500">Not Going</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-500">
                      {
                        selectedEvent.attendees.filter((a) => !a.response)
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-500">No Response</div>
                  </div>
                </div>
              </div>

              {/* Toggle button for User Responses */}
              <div className="mb-4">
                <button
                  onClick={() => setIsResponsesOpen(!isResponsesOpen)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isResponsesOpen ? "Hide Responses" : "Show All Responses"}
                </button>
                {isResponsesOpen && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      User Responses
                    </h4>
                    <ul className="space-y-2">
                      {selectedEvent.attendees.map((attendee) => (
                        <li
                          key={attendee.user.id}
                          className="flex justify-between"
                        >
                          <span>{attendee.user.name}</span>
                          <span
                            className={`font-medium ${
                              attendee.response === "going"
                                ? "text-green-600"
                                : attendee.response === "maybe"
                                ? "text-yellow-600"
                                : attendee.response === "notGoing"
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            {attendee.response || "No response"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* User's Response */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Your Response
                </h4>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const response = selectedEvent.attendees.find(
                      (a) => a.user.id === currentUser.id
                    )?.response;
                    const color =
                      response === "going"
                        ? "bg-green-500"
                        : response === "maybe"
                        ? "bg-yellow-500"
                        : response === "notGoing"
                        ? "bg-red-500"
                        : "bg-gray-300";
                    const label =
                      response === "going"
                        ? "You’re going"
                        : response === "maybe"
                        ? "You’re maybe"
                        : response === "notGoing"
                        ? "You’re not going"
                        : "No response";
                    return (
                      <>
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm text-gray-600">{label}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Response Buttons */}
              <div className="flex space-x-2">
                {["going", "maybe", "notGoing"].map((status) => {
                  const label =
                    status === "going"
                      ? "Going"
                      : status === "maybe"
                      ? "Maybe"
                      : "Not Going";
                  const color =
                    status === "going"
                      ? "bg-green-600"
                      : status === "maybe"
                      ? "bg-yellow-500"
                      : "bg-red-600";
                  const isSelected =
                    selectedEvent.attendees.find(
                      (a) => a.user.id === currentUser.id
                    )?.response === status;

                  return (
                    <button
                      key={status}
                      onClick={() =>
                        updateEventResponse(
                          selectedEvent.id,
                          status as "going" | "maybe" | "notGoing" | null
                        )
                      }
                      className={`flex-1 py-2 rounded-lg font-medium ${
                        isSelected
                          ? `${color} text-white`
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      } transition duration-200 ease-in-out cursor-pointer`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {isProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 animate-fadeInUp">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                {isEditingProfile ? "Edit Profile" : "Profile"}
              </h3>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsEditingProfile(false); // Reset edit mode when closing
                }}
                className="text-gray-500 hover:text-gray cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {!isEditingProfile ? (
                // View mode
                <>
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-24 h-24 rounded-full mb-4"
                    />
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedUser.name}
                    </h2>
                    <div className="text-gray-600">
                      @{selectedUser.username}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Bio</h4>
                    <p className="text-gray-600">{selectedUser.bio}</p>
                  </div>
                  <div className="flex justify-around mb-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {
                          communities.filter((c) =>
                            c.members.some(
                              (member) => member.id === selectedUser.id
                            )
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-500">Communities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {
                          posts.filter((p) => p.userId === selectedUser.id)
                            .length
                        }
                      </div>
                      <div className="text-sm text-gray-500">Posts</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setEditedUser({
                          id: selectedUser.id,
                          name: selectedUser.name,
                          username: selectedUser.username,
                          bio: selectedUser.bio,
                          avatar: selectedUser.avatar,
                        });
                      }}
                      className="w-full py-2 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition duration-200 ease-in-out cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                // Edit mode
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <img
                        src={editedUser.avatar}
                        alt={editedUser.name}
                        className="w-24 h-24 rounded-full"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded-full cursor-pointer hover:bg-gray-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <input
                          id="avatar-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    <div className="w-full mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editedUser.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">@</span>
                        <input
                          type="text"
                          name="username"
                          value={editedUser.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editedUser.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="w-1/2 py-2 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition duration-200 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveChanges();
                        setIsEditingProfile(false);
                      }}
                      className="w-1/2 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Community Settings Modal */}
      {isCommunityOpen && selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 animate-fadeInUp flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: selectedCommunity.color }}
                >
                  {selectedCommunity.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {selectedCommunity.name}
                </h3>
              </div>
              <button
                onClick={() => setIsCommunityOpen(false)}
                className="text-gray-500 hover:text-gray cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* Community Info */}
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-gray-600">
                    {selectedCommunity.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Members: {selectedCommunity.members.length}
                  </p>
                </div>
              </div>

              {/* Member List */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-2">
                  Members
                </h5>
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200">
                  {selectedCommunity.members.map((member) => (
                    <li
                      key={member.id}
                      className="py-2 flex items-center space-x-3"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{member.username}
                        </p>
                      </div>
                      {member.isOnline && (
                        <span className="ml-auto text-green-500 text-xs">
                          ● Online
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Leave Community Button */}
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  toggleJoinCommunity(selectedCommunity.id, currentUser);
                  setIsCommunityOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-semibold cursor-pointer"
              >
                {isUserInCommunity(selectedCommunity, currentUser)
                  ? "Leave Community"
                  : "Join Community"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
                  <span>Loading...</span>
                </div>
              </div>
            )}
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600 flex items-center">
                  <span className="text-blue-500">💫</span>
                  <span className="ml-2">ConnectHub</span>
                </div>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-3 py-2 font-medium transition duration-200 ease-in-out cursor-pointer ${
                  activeTab === "feed"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("communities")}
                className={`px-3 py-2 font-medium transition duration-200 ease-in-out cursor-pointer ${
                  activeTab === "communities"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Communities
              </button>
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center md:space-x-4">
              {/* Search Bar */}

              {/* Create Post Button */}
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="hidden md:block px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 ease-in-out cursor-pointer"
              >
                Create Post
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>

                  {/* Notification Counter */}
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn">
                    <div className="p-3 border-b flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        Notifications
                      </h3>
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((n) =>
                                  n.id === notification.id
                                    ? { ...n, isRead: true }
                                    : n
                                )
                              );

                              // Handle navigation based on notification type
                              if (
                                notification.type === "event" &&
                                notification.eventId
                              ) {
                                const event = events.find(
                                  (e) => e.id === notification.eventId
                                );
                                if (event) openEventDetails(event);
                              } else if (
                                (notification.type === "like" ||
                                  notification.type === "comment" ||
                                  notification.type === "post") &&
                                notification.postId
                              ) {
                                setActiveTab("feed");
                                setTimeout(() => {
                                  const postElement =
                                    postRefs.current[
                                      notification?.postId || ""
                                    ];
                                  if (postElement) {
                                    postElement.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                  }
                                }, 100); // Adjust delay if needed
                              }
                            }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <img
                                  src={getUserById(notification.userId).avatar}
                                  alt={getUserById(notification.userId).name}
                                  className="w-10 h-10 rounded-full"
                                />
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm text-gray-800">
                                  {notification.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {currentUser.name}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn">
                    <div className="p-3 border-b">
                      <div className="font-semibold text-gray-800">
                        {currentUser.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{currentUser.username}
                      </div>
                    </div>
                    <ul>
                      <li>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            openUserProfile(currentUser);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer"
                        >
                          View Profile
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Communities */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold text-gray-800 mb-4">
                Your Communities
              </h2>
              <div className="space-y-3">
                {communities
                  .filter((c) =>
                    c.members.some((member) => member.id === currentUser.id)
                  )
                  .map((community) => (
                    <button
                      key={community.id}
                      onClick={() => openCommunitySettings(community)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg ${community.color} flex items-center justify-center text-xl flex-shrink-0`}
                      >
                        {community.icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-gray-800 truncate text-left">
                          {community.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            {community.memberCount} members
                          </span>
                          {community.members.length > 0 && (
                            <div className="ml-2 flex -space-x-2">
                              {community.members
                                .slice(0, 3)
                                .map((member) => (
                                  <img
                                    key={member.id}
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-6 h-6 rounded-full border-2 border-white"
                                    title={member.name}
                                  />
                                ))}
                              {community.members.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                  +{community.members.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Center Content - Feed */}
          <div className="flex-grow">
            {activeTab === "feed" && (
              <div className="space-y-6">
                <div className="relative mx-4">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out ${
                        isSearchFocused ? "bg-white shadow-md" : "bg-gray-100"
                      }`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No posts available in the communities you&apos;re a part of.
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      ref={(el) => {
                        postRefs.current[post.id] = el;
                      }}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={getUserById(post.userId).avatar}
                            alt={getUserById(post.userId).name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800">
                                  {getUserById(post.userId).name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatTime(post.createdAt)} ·{" "}
                                  {getCommunityById(post.communityId).name}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-gray-800">
                              {post.content}
                            </div>

                            <div className="mt-4 flex items-center space-x-4">
                              <button
                                onClick={() => toggleLikePost(post.id)}
                                className={`flex items-center space-x-1 ${
                                  post.isLiked
                                    ? "text-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                                } cursor-pointer`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill={post.isLiked ? "currentColor" : "none"}
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                                <span>{post.likes}</span>
                              </button>
                              <button
                                onClick={() => toggleExpandComments(post.id)}
                                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                <span>{post.comments.length}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.includes(post.id) && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="space-y-4">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start space-x-3"
                              >
                                <img
                                  src={getUserById(comment.userId).avatar}
                                  alt={getUserById(comment.userId).name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-grow">
                                  <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="font-medium text-gray-800">
                                      {getUserById(comment.userId).name}
                                    </div>
                                    <div className="text-gray-800">
                                      {comment.content}
                                    </div>
                                  </div>
                                  <div className="mt-1 flex items-center space-x-4 text-sm">
                                    <span className="text-gray-500">
                                      {formatTime(comment.createdAt)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        toggleLikeComment(post.id, comment.id)
                                      }
                                      className={`flex items-center space-x-1 ${
                                        comment.isLiked
                                          ? "text-blue-600"
                                          : "text-gray-500 hover:text-gray-700"
                                      } cursor-pointer`}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill={
                                          comment.isLiked
                                            ? "currentColor"
                                            : "none"
                                        }
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                      </svg>
                                      <span>{comment.likes}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Comment */}
                          <div className="mt-4 flex items-center space-x-3">
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-grow">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newComment[post.id] || ""}
                                onChange={(e) =>
                                  handleCommentChange(post.id, e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    addComment(post.id);
                                  }
                                }}
                              />
                            </div>
                            <button
                              onClick={() => addComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              className={`px-4 py-2 rounded-full text-white font-medium cursor-pointer ${
                                newComment[post.id]?.trim()
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-blue-300 cursor-not-allowed"
                              } transition duration-200 ease-in-out`}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "communities" && (
              <div className="w-full  flex-shrink-0">
                <div className="space-y-6">
                  {/* Community List */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-semibold text-gray-800 mb-4">
                      Communities
                    </h2>
                    <div className="space-y-4">
                      {filterCommunities().map((community) => (
                        <button
                          key={community.id}
                          onClick={() => openCommunitySettings(community)}
                          className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg ${community.color} flex items-center justify-center text-xl flex-shrink-0`}
                          >
                            {community.icon}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="font-medium text-gray-800 truncate text-left">
                              {community.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                {community.memberCount} members
                              </span>
                              {community.members.length > 0 && (
                                <div className="ml-2 flex -space-x-2">
                                  {community.members
                                    .slice(0, 3)
                                    .map((member) => (
                                      <img
                                        key={member.id}
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-6 h-6 rounded-full border-2 border-white"
                                        title={member.name}
                                      />
                                    ))}
                                  {community.members.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                      +{community.members.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Events & Members */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold text-gray-800 mb-4">
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                <button
  onClick={() => setShowCreateEvent(true)}
  className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
>
  + Create Event
</button>
                  {events.filter((event) =>
    // Check if the current event's communityId matches any community the current user is a part of
    communities.some((community) => community.id === event.communityId && community.members.some((member) => member.id === currentUser.id))
  ).map((event) => {
                    const goingCount = event.attendees.filter(
                      (attendee) => attendee.response === "going"
                    ).length;

                    const currentUserAttendee = event.attendees.find(
                      (attendee) => attendee.user?.id === currentUser.id
                    );

                    const currentUserResponse =
                      currentUserAttendee?.response ?? null;

                    const responseColor =
                      currentUserResponse === "going"
                        ? "bg-green-500"
                        : currentUserResponse === "maybe"
                        ? "bg-yellow-500"
                        : currentUserResponse === "notGoing"
                        ? "bg-red-500"
                        : "bg-gray-300";

                    const responseLabel =
                      currentUserResponse === "going"
                        ? "You’re going"
                        : currentUserResponse === "maybe"
                        ? "Maybe you’re going"
                        : currentUserResponse === "notGoing"
                        ? "You’re not going"
                        : "No response";

                    return (
                      <div
                        key={event.id}
                        onClick={() => openEventDetails(event)}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                      >
                        <div className="font-medium text-gray-800">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {format(parseISO(event.date), "MMM d")} ·{" "}
                          {event.startTime}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {goingCount} going
                        </div>

                        {/* User response section */}
                        <div className="flex items-center space-x-2 mt-2">
                          <div
                            className={`w-2 h-2 rounded-full ${responseColor}`}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {responseLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default One;
