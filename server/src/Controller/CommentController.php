<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Repository\ArticleRepository;
use App\Repository\CommentRepository;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/comments', name:'comments')]
class CommentController extends AbstractController
{
    
    /**
     * @var EntityManagerInterface 
     */
    private $em;

    /**
     * @var CommentRepository
     */
    private $commentRepository;

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
     * @param CommentRepository $commentRepository
     * @param ArticleRepository $articleRepository
     * @param UserRepository $userRepository
     */
    public function __construct(
        EntityManagerInterface $em,
        CommentRepository $commentRepository,
        ArticleRepository $articleRepository,
        UserRepository $userRepository
    ){
        $this->em                = $em;
        $this->commentRepository = $commentRepository;
        $this->articleRepository = $articleRepository;
        $this->userRepository    = $userRepository;
        
    }

    // #[Route('/', name: 'list')]
    // public function list(): JsonResponse
    // {
    //     $comments = $this->commentRepository->findAll();
    //     dd($comments);
    //     return $this->json([
    //         'message' => 'Welcome to your new controller!',
    //         'path' => 'src/Controller/CommentController.php',
    //     ]);
    // }

    #[Route('/create', name:'create', methods:'POST')]
    public function create(Request $request): JsonResponse
    {
        $articleId = $request->getPayload()->get('article');
        if(!$articleId) return $this->json(['message' => 'Wrong article'], JsonResponse::HTTP_BAD_REQUEST);

        $article = $this->articleRepository->findOneBy(['id' => $articleId]);

        $text = $request->getPayload()->get('text');
        $userId = $request->getPayload()->get('user');
        if(empty($text)) return $this->json(['message' => 'Comment should not be empty.'], JsonResponse::HTTP_BAD_REQUEST);
        if(!$userId) return $this->json(['message' => 'You are not authorized.'], JsonResponse::HTTP_UNAUTHORIZED);
        
        $text = htmlspecialchars(trim($text), HTML_ENTITIES, 'utf-8');
        $date = new DateTimeImmutable();

        $user = $this->userRepository->findOneBy(['email' => $userId]);
        if(!$user) return $this->json(['message' => 'You are not authorized.'], JsonResponse::HTTP_UNAUTHORIZED);

        $comment = new Comment();
        $comment->setText($text);
        $comment->setCreatedAt($date);
        $comment->setArticle($article);
        $comment->setUser($user);

        $this->em->persist($comment);
        $this->em->flush();

        return $this->json([
            'id' => $comment->getId(),
            'text' => $comment->getText(),
            'createdAt' => $comment->getCreatedAt(),
            'likes' => $comment->getLikes(),
            'user' => [
                'id' => $comment->getUser()->getId(),
                'name' => $comment->getUser()->getName(),
                'email' => $comment->getUser()->getEmail()
            ]
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/comment/like', name:'like', methods:['PUT'])]
    public function like(Request $request): JsonResponse
    {
        $commentId = $request->getPayload()->get('comment');
        $comment = $this->commentRepository->findOneBy(['id' => $commentId]);
        if(!$comment) return $this->json(['message' => 'Something went Wrong.'], 400);

        $comment->setLikes($comment->getLikes()+1);
        $this->em->persist($comment);
        $this->em->flush();

        return $this->json(['id'=>$commentId], JsonResponse::HTTP_OK);
    }

}
