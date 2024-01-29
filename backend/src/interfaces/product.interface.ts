import { CreateOrUpdateProductDto, CreateOrUpdateProductReviewDto } from 'src/dto';

export interface ProductResponse extends CreateOrUpdateProductDto {
  reviews?: Array<CreateOrUpdateProductReviewDto>;
}

export interface ProductReviewResponse extends CreateOrUpdateProductReviewDto {
  reviews?: Array<CreateOrUpdateProductReviewDto>;
}
