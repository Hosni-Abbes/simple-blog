<?php

namespace App\Controller;

use App\Entity\Article;
use App\Repository\ArticleRepository;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/articles', name:'article')]
class ArticleController extends AbstractController
{
    /** 
     * @var EntityManagerInterface
     */
    private $em;
    
    /**
     * @var ArticleRepository
     */
    private $articleRepository;

    /**
     * @var UserRepository
     */
    private $userRepository;

    /**
     * @param EntityManagerInterface $em
     * @param ArticleRepository $articleRepository
     * @param UserRepository $userRepository
     */
    public function __construct(
            EntityManagerInterface $em,
            ArticleRepository $articleRepository,
            UserRepository $userRepository
    ){
        $this->em                = $em;
        $this->articleRepository = $articleRepository;
        $this->userRepository    = $userRepository;
    }

    #[Route('/list', name: 'list', methods:['GET'])]
    public function list(): JsonResponse
    {
        $articles = $this->articleRepository->findBy([], ['id' => 'DESC']);
        if(count($articles) < 1) return $this->json([], JsonResponse::HTTP_OK);

        $arrArticles = [];
        foreach ($articles as $article){
            $arrComments=[];
            $comments = $article->getComments();
            if(count($comments)){
                foreach ($comments as $comment){
                    array_push($arrComments, [
                        'id' => $comment->getId(),
                        'text' => $comment->getText(),
                        'createdAt' => $comment->getCreatedAt()
                    ]);
                }
            }
            array_push($arrArticles, [
                'id' => $article->getId(),
                'title' => $article->getTitle(),
                'body' => $article->getBody(),
                'createdAt' => $article->getCreatedAt(),
                'likes' => $article->getLikes(),
                'comments' => $arrComments,
                'user' => [
                    'id' => $article->getUser()->getId(),
                    'name' => $article->getUser()->getName(),
                    'email' => $article->getUser()->getEmail()
                ]
            ]);
        }
        return $this->json($arrArticles, JsonResponse::HTTP_OK);
    }

    #[Route('/article/{id}', name:'article', methods:['GET'])]
    public function show($id): JsonResponse
    {
        $article = $this->articleRepository->findOneBy(['id' => $id]);
        if(!$article) return $this->json(['message' => 'Article not exist'], JsonResponse::HTTP_NOT_FOUND);

        $articleComments = $article->getComments();
        $comments= [];
        if(count($articleComments)){
            foreach ($articleComments as $comment){
                array_push($comments, [
                    'id' => $comment->getId(),
                    'text' => $comment->getText(),
                    'createdAt' => $comment->getCreatedAt(),
                    'likes' => $comment->getLikes(),
                    'user' => [
                        'id' => $comment->getUser()->getId(),
                        'name' => $comment->getUser()->getName(),
                        'email' => $comment->getUser()->getEmail()
                    ]
                ]);
            }
        }
        $article = [
            'id' => $article->getId(),
            'title' => $article->getTitle(),
            'body' => $article->getBody(),
            'createdAt' => $article->getCreatedAt(),
            'likes' => $article->getLikes(),
            'comments' => $comments,
            'user' => [
                'id' => $article->getUser()->getId(),
                'name' => $article->getUser()->getName(),
                'email' => $article->getUser()->getEmail()
            ]
        ];
        return $this->json($article, JsonResponse::HTTP_OK);
    }

    #[Route('/create', name:'create', methods:['POST'])]
    public function create(Request $request): JsonResponse
    {
        $title = $request->getPayload()->get('title');
        $body = $request->getPayload()->get('body');
        $userId = $request->getPayload()->get('user');
        
        if(!$title || !$body || !$userId) return $this->json(['message'=>'All fields are required.'], JsonResponse::HTTP_BAD_REQUEST);

        $title = trim($title);
        $body  = trim($body);
        $title = htmlspecialchars($title, HTML_ENTITIES, 'utf-8');
        $body  = htmlspecialchars($body, HTML_ENTITIES, 'utf-8');
        $date = new DateTimeImmutable();

        $user = $this->userRepository->findOneBy(['email' => $userId]);
        if(!$user) return $this->json(['message' => 'You are not authorized.'], JsonResponse::HTTP_UNAUTHORIZED);

        $article = new Article;
        $article->setTitle($title);
        $article->setBody($body);
        $article->setCreatedAt($date);
        $article->setUser($user);

        $this->em->persist($article);
        $this->em->flush();
        
        return $this->json([
            'id' => $article->getId(),
            'title' => $title,
            'body' => $body,
            'createdAt' => $article->getCreatedAt(),
            'likes' => $article->getLikes(),
            'comments' => [],
            'user' => [
                'id' => $article->getUser()->getId(),
                'name' => $article->getUser()->getName(),
                'email' => $article->getUser()->getEmail()
            ]            
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/update/{id}', name:'update', methods:['PUT'])]
    public function update(Request $request, $id): JsonResponse
    {
        $title = $request->getPayload()->get('title');
        $body  = $request->getPayload()->get('body');

        if(empty($title) || empty($body)) return $this->json(['message' => 'Title and body should not be empty.']);
        $title = htmlspecialchars(trim($title), HTML_ENTITIES, 'utf-8');
        $body  = htmlspecialchars(trim($body), HTML_ENTITIES, 'utf-8');
        
        $article = $this->articleRepository->findOneBy(['id' => $id]);
        if(!$article) return $this->json(['message' => 'Article not exist'], JsonResponse::HTTP_NOT_FOUND);
        
        $article->setTitle($title);
        $article->setBody($body);
        $this->em->persist($article);
        $this->em->flush();
        
        return $this->json([
            'id' => $id,
            'title' => $article->getTitle(),
            'body' => $article->getBody()
        ], JsonResponse::HTTP_OK);

    }

    #[Route('/delete/{id}', name:'delete', methods:['DELETE'])]
    public function delete($id): JsonResponse
    {
        $article = $this->articleRepository->findOneBy(['id' => $id]);
        if(!$article) return $this->json(['message' => 'Article not exist.'], JsonResponse::HTTP_NOT_FOUND);

        $this->em->remove($article);
        $this->em->flush();

        return $this->json(['id' => $id], JsonResponse::HTTP_OK);
    }

    #[Route('/article/{id}/like', name:'like', methods:['PUT'])]
    public function like($id): JsonResponse
    {
        $article = $this->articleRepository->findOneBy(['id' => $id]);
        if(!$article) return $this->json(['message' => 'Article not exist.'], JsonResponse::HTTP_NOT_FOUND);

        $article->setLikes($article->getLikes() + 1);
        $this->em->persist($article);
        $this->em->flush();

        return $this->json(['id' => $article->getId()], JsonResponse::HTTP_OK);
    }

}
